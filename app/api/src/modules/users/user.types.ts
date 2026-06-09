export interface User {
   id: string;
   email: string;
   name: string;
   google_id?: string;
   avatar_url?: string;
   created_at: Date;
   updated_at: Date;
 }

 export interface CreateUserInput {
   email: string;
   name: string;
   google_id?: string;
   avatar_url?: string;
 }
 
 export interface UpdateUserInput {
   name?: string;
   avatar_url?: string;
 }
