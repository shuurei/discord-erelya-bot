import { BitField } from 'discord.js'
import { UserEntityFlags, UserEntityFlag } from './userEntityFlags'

export class UserEntityFlagsBitField extends BitField<UserEntityFlag> {
    static Flags = UserEntityFlags
}

export default UserEntityFlagsBitField;

