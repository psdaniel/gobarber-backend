import nodemailer, { Transporter } from 'nodemailer';
import { injectable, inject } from 'tsyringe';
import aws from 'aws-sdk';

import ISendMailDTO from '../dtos/ISendMailDTO';
import IMailProvider from '../models/IMailProvider';

import IMailTemplateProvider from '@shared/container/providers/MailTemplateProvider/models/IMailTemplateProvider';

@injectable()
export default class SESMailProvider implements IMailProvider {
    private client: Transporter;

    constructor(
        @inject('MailTemplateProvider')
        private mailTemplateProvider: IMailTemplateProvider,
    ) {
        this.client = nodemailer.createTransport({
            SES: new aws.SES({
                apiVersion: '2010-12-01'
            })
        });
    }

    public async sendMail({
        to,
        subject,
        from,
        templateData } : ISendMailDTO): Promise<void> {
            await this.client.sendMail({
                from: {
                    name: from?.name || 'Equipe GoBarber',
                    address: from?.email || 'equipe@gobarber.com.br'
                },
                to: {
                    name: to.name,
                    address: to.email
                },
                subject,
                html: await this.mailTemplateProvider.parse(templateData),
            })

        }
    }
