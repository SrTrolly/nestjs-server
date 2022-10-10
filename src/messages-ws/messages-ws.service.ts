import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { userInfo } from 'os';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly UserReposotory: Repository<User>
    ) { }

    async registerClient(client: Socket, userId: string) {
        const userDB = await this.UserReposotory.findOneBy({ id: userId });
        if (!userDB) throw new Error("User not found");
        if (!userDB.isActive) throw new Error("User not active");

        this.checkUserConnection(userDB);

        this.connectedClients[client.id] = {
            socket: client,
            user: userDB
        }
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        console.log(this.connectedClients);
        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string) {
        return this.connectedClients[socketId].user.fullName;
    }

    private checkUserConnection(user: User) {
        for (const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId];

            if (connectedClient.user.id === user.id) {
                connectedClient.socket.disconnect();
                break;
            }
        }

    }

}
