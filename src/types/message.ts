import type { ID, ISODateString } from './common';
import type { UserRole } from './user';

export interface MessageSender {
  id: ID;
  name: string;
  role: UserRole;
}

export interface Message {
  id: ID;
  from: MessageSender;
  to: MessageSender;
  subject: string;
  body: string;
  createdAt: ISODateString;
  read: boolean;
}
