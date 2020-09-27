import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notification/repositories/INotificationsRepository';



interface IRequest {
    provider_id: string;
    user_id: string;
    date: Date;
}

@injectable()
class CreateAppointmentService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository,

        @inject('NotificationsRepository')
        private notificationsRepository: INotificationsRepository,
        ) {

    }

    public async execute({ date, provider_id, user_id }: IRequest): Promise<Appointment> {
        const appointmentDate = startOfHour(date);

        if(isBefore(appointmentDate, Date.now())) {
            throw new AppError("You can't create an appointment on a past date.")
        }

        if(user_id === provider_id) {
            throw new AppError("You can't create an appointment with yourself.")
        }

        if(getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
            throw new AppError('You can create appointments only between 8am and 5pm')
        }

        const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
            appointmentDate,
        );

        if (findAppointmentInSameDate) {
            throw new AppError('This appointment is already booked');
        };

        const appointment = await this.appointmentsRepository.create({
            provider_id,
            user_id,
            date: appointmentDate,
        });

        const formattedDate = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm'h'")

        await this.notificationsRepository.create({
            recipient_id: provider_id,
            content: `Novo agendamento para o dia ${formattedDate}`,
        })

        return appointment;
    }
}

export default CreateAppointmentService;
