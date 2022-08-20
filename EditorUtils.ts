import { Editor } from "obsidian";

export default class EditorUtils {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public getLineContentUnderCursor() {
    const cursorPosition = this.editor.getCursor(); 
    return this.editor.getLine(cursorPosition.line); 
  }

  public replaceCurrentLine(newLine: string) {
    const cursorPosition = this.editor.getCursor();
    const lineText = this.editor.getLine(cursorPosition.line);
    this.editor.replaceRange(
      newLine,
      { line: cursorPosition.line, ch: 0 },
      { line: cursorPosition.line, ch: lineText.length }
    );
  }
}
