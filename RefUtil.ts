export default class RefUtil {
  public static lineWithRefPattern = /(.*)(==\d+-REF==).*/;

  public static generateRef(refNumber: number) {
    return `==${refNumber}-REF==`;
  }
}
