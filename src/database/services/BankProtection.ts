import { DeepPartial } from 'typeorm'

import { BankProtection } from '../entities/BankProtection'
import db from '../db'

type BankProtectionWhere = Required<Pick<DeepPartial<BankProtection>, 'userId' | 'guildId'>>

export class BankProtectionService {
    static get repo() {
        return db.getRepository(BankProtection);
    }

    static async getAll(where: BankProtectionWhere) {
        return await this.repo.find({ where, order: { createdAt: 'ASC' } });
    }

    static async getLast(where: BankProtectionWhere) {
        return await this.repo.findOne({ where, order: { createdAt: 'ASC' } });
    }

    static async add(where: BankProtectionWhere, data: DeepPartial<BankProtection>) {
        const count = await this.repo.count({ where });
        if (count >= 2) return;

        return await this.repo.save(this.repo.create({ ...where, ...data }));
    }

    static async remove(where: BankProtection) {
        return await this.repo.delete(where);
    }
}