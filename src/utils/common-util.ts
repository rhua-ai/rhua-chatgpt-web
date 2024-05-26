export class CommonUtil {

  static getDateString(): string {
    const currentDate = new Date();
    return currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getDate();
  }

  static mergeAndDeduplication(...arrays: string[][]): string[] {
    return [...new Set(arrays.flat())];
  }
}