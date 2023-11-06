// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      description: number
      created_at: string
      session_id?: string
      diet_status: boolean
    }
  }
}
