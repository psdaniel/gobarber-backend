import { injectable, inject } from 'tsyringe';
import { getHours, isAfter } from 'date-fns';

import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

//import User from '@modules/users/infra/typeorm/entities/User';

interface Request {
    provider_id: string;
    day: number;
    month: number;
    year: number;
}

type Response = Array<{
    hour: number;
    available: boolean;
}>;

@injectable()
class ListProviderDayAvailabilityService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository,
    ) {}

    public async execute({ provider_id, day, year, month }: Request): Promise<Response> {
        const appointments = await this.appointmentsRepository.findAllInDayFromProvider({
            provider_id,
            day,
            year,
            month
        });

        const hourStart = 8;

        const eachHourArray = Array.from({ length: 10 }, (_, index) => index + hourStart,
        );

        const availability = eachHourArray.map(hour => {
            const hasAppointmentInHour = appointments.find(appointment => getHours(appointment.date) === hour, );

            const currentDate = new Date(Date.now());
            const compareDate = new Date(year, month - 1, day, hour);

            return {
                hour,
                available: !hasAppointmentInHour && isAfter(compareDate, currentDate),
            }
        });

        return availability;
    }
}

export default ListProviderDayAvailabilityService;
