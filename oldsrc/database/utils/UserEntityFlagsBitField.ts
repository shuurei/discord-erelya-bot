import { BitField } from 'discord.js'
import { UserEntityFlags, UserEntityFlag } from './UserEntityFlags'

export class UserEntityFlagsBitField extends BitField<UserEntityFlag> {
    static Flags = UserEntityFlags
}

export default UserEntityFlagsBitField;