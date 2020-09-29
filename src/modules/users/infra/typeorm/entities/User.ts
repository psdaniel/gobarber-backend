import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import uploadConfig from '@config/upload';

import { Exclude, Expose } from 'class-transformer';

@Entity('users')
class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    avatar: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Expose({ name: 'avatar_url'})
    getAvatarUrl(): string | null {
        if(!this.avatar) {
            return null;
        }

        switch (uploadConfig.driver) {
            case 'disk':
                return  `http://localhost:3333/files/${this.avatar}`;
            case 's3':
                return `http://localhost:3333/`
            default:
                return null;
        }

    }
}

export default User;
