import { WithLogger } from '../utils/class-with-logger'

/**
 * Provides data of a fixed type from a source.
 *
 * @export
 * @abstract
 * @class DataProvider
 * @extends {WithLogger}
 * @template T
 */
export abstract class DataProvider<T> extends WithLogger {
  /**
   * Returns the data which is provided.
   *
   * @abstract
   * @return {*}  {Promise<T>}
   * @memberof DataProvider
   */
  abstract getData (): Promise<T>
}
