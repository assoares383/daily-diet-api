// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      username: string
      email: string
      session_id?: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      on_diet: boolean
      created_at: string
    }
  }
}
