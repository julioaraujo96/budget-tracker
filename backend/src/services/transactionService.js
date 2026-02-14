import { transactionRepository } from '../repositories/transactionRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { NotFoundError, ValidationError } from '../errors.js';

/**
 * Creates a transaction service bound to the given repositories.
 * @param {object} deps
 * @param {object} deps.transactionRepo - Transaction repository instance
 * @param {object} deps.categoryRepo - Category repository instance
 * @returns {object} Transaction service with business logic
 */
export function createTransactionService({ transactionRepo, categoryRepo }) {
  return {
    /**
     * Retrieves transactions with optional filters.
     * @param {object} [filters] - Filter criteria (type, categoryId, startDate, endDate)
     * @returns {Promise<Array>} Filtered list of transactions
     */
    async getAll(filters) {
      return transactionRepo.findAll(filters);
    },

    /**
     * Finds a single transaction by ID.
     * @param {number} id - Transaction ID
     * @returns {Promise<object>} The transaction
     * @throws {NotFoundError} If the transaction does not exist
     */
    async getById(id) {
      const transaction = await transactionRepo.findById(id);
      if (!transaction) {
        throw new NotFoundError('Transaction');
      }
      return transaction;
    },

    /**
     * Creates a new transaction.
     * Validates the referenced category exists when categoryId is provided.
     * @param {object} data - Transaction data
     * @returns {Promise<object>} The created transaction
     * @throws {ValidationError} If the referenced category does not exist
     */
    async create(data) {
      if (data.categoryId) {
        const category = await categoryRepo.findById(data.categoryId);
        if (!category) {
          throw new ValidationError('Category not found');
        }
      }

      const transaction = {
        ...data,
        date: data.date || new Date().toISOString().split('T')[0],
      };

      return transactionRepo.create(transaction);
    },

    /**
     * Updates an existing transaction.
     * Validates the referenced category exists when categoryId is provided.
     * @param {number} id - Transaction ID
     * @param {object} data - Fields to update
     * @returns {Promise<object>} The updated transaction
     * @throws {NotFoundError} If the transaction does not exist
     * @throws {ValidationError} If the referenced category does not exist
     */
    async update(id, data) {
      const existing = await transactionRepo.findById(id);
      if (!existing) {
        throw new NotFoundError('Transaction');
      }

      if (data.categoryId) {
        const category = await categoryRepo.findById(data.categoryId);
        if (!category) {
          throw new ValidationError('Category not found');
        }
      }

      return transactionRepo.update(id, data);
    },

    /**
     * Deletes a transaction by ID.
     * @param {number} id - Transaction ID
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the transaction does not exist
     */
    async delete(id) {
      const existing = await transactionRepo.findById(id);
      if (!existing) {
        throw new NotFoundError('Transaction');
      }
      return transactionRepo.delete(id);
    },

    /**
     * Generates date occurrences for a recurring transaction.
     * @param {object} baseTransaction - Base transaction data (without recurringGroupId)
     * @param {string} frequency - 'weekly', 'monthly', or 'annual'
     * @param {number} [count=12] - Number of occurrences to generate
     * @returns {Array<object>} Array of transaction objects with computed dates
     */
    generateOccurrences(baseTransaction, frequency, count = 12) {
      const occurrences = [];
      const [year, month, day] = baseTransaction.date.split('-').map(Number);

      for (let i = 0; i < count; i++) {
        // Use UTC to avoid local-timezone drift when manipulating months/years
        const date = new Date(Date.UTC(year, month - 1, day));

        if (frequency === 'monthly') {
          date.setUTCMonth(date.getUTCMonth() + i);
        } else if (frequency === 'weekly') {
          date.setUTCDate(date.getUTCDate() + i * 7);
        } else if (frequency === 'annual') {
          date.setUTCFullYear(date.getUTCFullYear() + i);
        }

        occurrences.push({
          ...baseTransaction,
          date: date.toISOString().split('T')[0],
        });
      }

      return occurrences;
    },

    /**
     * Creates a recurring transaction, generating 12 occurrences.
     * All occurrences share the same recurringGroupId for batch operations.
     * @param {object} data - Transaction data including frequency
     * @param {string} data.frequency - 'weekly', 'monthly', or 'annual'
     * @returns {Promise<{ groupId: number, transactions: Array }>} The group ID and created transactions
     * @throws {ValidationError} If the referenced category does not exist
     */
    async createRecurring(data) {
      const { frequency, ...transactionData } = data;

      if (transactionData.categoryId) {
        const category = await categoryRepo.findById(transactionData.categoryId);
        if (!category) {
          throw new ValidationError('Category not found');
        }
      }

      transactionData.date =
        transactionData.date || new Date().toISOString().split('T')[0];

      const occurrences = this.generateOccurrences(
        transactionData,
        frequency,
        12,
      );
      const groupId = Date.now();

      const transactions = await Promise.all(
        occurrences.map((occurrence) =>
          transactionRepo.create({ ...occurrence, recurringGroupId: groupId }),
        ),
      );

      return { groupId, transactions };
    },

    /**
     * Lists all recurring transaction groups with summary information.
     * @returns {Promise<Array>} Array of group summaries
     */
    async getRecurringGroups() {
      const all = await transactionRepo.findAll();
      const grouped = {};

      for (const tx of all) {
        if (tx.recurringGroupId) {
          if (!grouped[tx.recurringGroupId]) {
            grouped[tx.recurringGroupId] = [];
          }
          grouped[tx.recurringGroupId].push(tx);
        }
      }

      return Object.entries(grouped).map(([groupId, txs]) => {
        // Sort by date ascending to get first/last reliably
        txs.sort((a, b) => a.date.localeCompare(b.date));

        return {
          groupId: Number(groupId),
          count: txs.length,
          type: txs[0].type,
          amount: txs[0].amount,
          description: txs[0].description,
          categoryId: txs[0].categoryId,
          firstDate: txs[0].date,
          lastDate: txs[txs.length - 1].date,
        };
      });
    },

    /**
     * Cancels a recurring subscription by deleting future occurrences.
     * @param {number} groupId - Recurring group ID
     * @param {string} [fromDate] - Delete from this date onward (YYYY-MM-DD). Defaults to all.
     * @returns {Promise<void>}
     * @throws {NotFoundError} If no transactions exist for the given group
     */
    async cancelRecurring(groupId, fromDate) {
      const group = await transactionRepo.findByGroupId(groupId);
      if (group.length === 0) {
        throw new NotFoundError('Recurring group');
      }

      return transactionRepo.deleteByGroupId(groupId, fromDate);
    },

    /**
     * Updates future occurrences of a recurring subscription.
     * @param {number} groupId - Recurring group ID
     * @param {string} fromDate - Update from this date onward (YYYY-MM-DD)
     * @param {object} data - Fields to update
     * @returns {Promise<Array>} The updated transactions
     * @throws {NotFoundError} If no transactions exist for the given group
     */
    async updateRecurring(groupId, fromDate, data) {
      const group = await transactionRepo.findByGroupId(groupId);
      if (group.length === 0) {
        throw new NotFoundError('Recurring group');
      }

      return transactionRepo.updateFutureByGroupId(groupId, fromDate, data);
    },
  };
}

/** Default transaction service using the application repositories */
export const transactionService = createTransactionService({
  transactionRepo: transactionRepository,
  categoryRepo: categoryRepository,
});
