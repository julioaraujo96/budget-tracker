import { categoryRepository } from '../repositories/categoryRepository.js';
import { transactionRepository } from '../repositories/transactionRepository.js';
import { NotFoundError, ValidationError } from '../errors.js';

/**
 * Creates a category service bound to the given repositories.
 * @param {object} deps
 * @param {object} deps.categoryRepo - Category repository instance
 * @param {object} deps.transactionRepo - Transaction repository instance
 * @returns {object} Category service with business logic
 */
export function createCategoryService({ categoryRepo, transactionRepo }) {
  return {
    /**
     * Retrieves all categories.
     * @returns {Promise<Array>} List of all categories
     */
    async getAll() {
      return categoryRepo.findAll();
    },

    /**
     * Finds a single category by ID.
     * @param {number} id - Category ID
     * @returns {Promise<object>} The category
     * @throws {NotFoundError} If the category does not exist
     */
    async getById(id) {
      const category = await categoryRepo.findById(id);
      if (!category) {
        throw new NotFoundError('Category');
      }
      return category;
    },

    /**
     * Creates a new category.
     * @param {object} data - Category data ({ name, type })
     * @returns {Promise<object>} The created category
     */
    async create(data) {
      return categoryRepo.create(data);
    },

    /**
     * Updates an existing category.
     * @param {number} id - Category ID
     * @param {object} data - Fields to update ({ name?, type? })
     * @returns {Promise<object>} The updated category
     * @throws {NotFoundError} If the category does not exist
     */
    async update(id, data) {
      const existing = await categoryRepo.findById(id);
      if (!existing) {
        throw new NotFoundError('Category');
      }
      return categoryRepo.update(id, data);
    },

    /**
     * Deletes a category if it has no associated transactions.
     * @param {number} id - Category ID
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the category does not exist
     * @throws {ValidationError} If the category has associated transactions
     */
    async delete(id) {
      const existing = await categoryRepo.findById(id);
      if (!existing) {
        throw new NotFoundError('Category');
      }

      const hasTransactions = await transactionRepo.existsByCategoryId(id);
      if (hasTransactions) {
        throw new ValidationError(
          'Cannot delete category with associated transactions',
        );
      }

      return categoryRepo.delete(id);
    },
  };
}

/** Default category service using the application repositories */
export const categoryService = createCategoryService({
  categoryRepo: categoryRepository,
  transactionRepo: transactionRepository,
});
