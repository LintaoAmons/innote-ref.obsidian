import { MarkdownView, Plugin } from "obsidian";
import EditorUtils from "./EditorUtils";
import RefUtil from "./RefUtil";

export default class MyPlugin extends Plugin {
  private mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
  private editor = this.app.workspace.getActiveViewOfType(MarkdownView).editor;
  private editorUtils = new EditorUtils(this.editor);

  async onload() {
    this.addCommand({
      id: "insert-or-jump-to-next",
      name: "Insert or Jump",
      checkCallback: (checking: boolean) => {
        if (checking)
          return !!this.app.workspace.getActiveViewOfType(MarkdownView);
        this.insertAtLineEndOrJump();
      },
    });
    this.addCommand({
      id: "jump to preview",
      name: "Jump to previews",
      checkCallback: (checking: boolean) => {
        if (checking)
          return !!this.app.workspace.getActiveViewOfType(MarkdownView);
        this.jumpPreview();
      },
    });
    this.addCommand({
      id: "insert in place",
      name: "Insert in place or Jump",
      checkCallback: (checking: boolean) => {
        if (checking)
          return !!this.app.workspace.getActiveViewOfType(MarkdownView);
        this.insertInPlaceOrJump();
      },
    });
  }

  private insertInPlaceOrJump() {
    if (this.hasRefInCurrentLine()) {
      this.jumpToNextRef();
    } else {
      this.insertInPlace();
    }
  }

  private insertAtLineEndOrJump() {
    if (this.hasRefInCurrentLine()) {
      this.jumpToNextRef();
    } else {
      this.insertAtLineEnd();
    }
  }

  private insertAtLineEnd() {
    const currentPosition = this.editor.getCursor();
    const newLine = this.generateNewLineAtLineEnd();
    this.editorUtils.replaceCurrentLine(newLine);
    this.editor.setCursor(currentPosition);
  }

  private insertInPlace() {
    const currentPosition = this.editor.getCursor();
    const newLine = this.generateNewLineInPosition();
    this.editorUtils.replaceCurrentLine(newLine);
    this.editor.setCursor(currentPosition);
  }

  private generateNewLineInPosition() {
    const { linePart1, linePart2 } = this.splitLineByCursor();
    const currentNumber = this.countCurrentNumber();
    const refText = RefUtil.generateRef(currentNumber);

    if (linePart1.length === 0 && linePart2.length === 0) {
      return refText;
    } else if (linePart1.length === 0 && linePart2.length > 0) {
      return `${refText} ${linePart2}`;
    } else if (linePart1.length > 0 && linePart2.length <= 1) {
      return `${linePart1}${linePart2} ${refText}`;
    } else {
      return `${linePart1} ${refText} ${linePart2}`;
    }
  }

  private generateNewLineAtLineEnd() {
    const lineText = this.editorUtils.getLineContentUnderCursor();
    const currentNumber = this.countCurrentNumber();
    const refText = RefUtil.generateRef(currentNumber);

    if (lineText.length === 0) {
      return refText;
    } else {
      return `${lineText} ${refText}`;
    }
  }

  private jumpToNextRef() {
    const currentRef = this.getCurrentLineRef();
    const nextLineNumber = this.editor.getCursor().line + 1;
    for (let i = nextLineNumber; i < this.editor.lineCount(); i++) {
      const theLine = this.editor.getLine(i);
      if (theLine.match(currentRef)) {
        const linePartBeforeRef = theLine.match(RefUtil.lineWithRefPattern)[1];
        this.editor.setCursor({ line: i, ch: linePartBeforeRef.length + 1 });
        return;
      }
    }
    return;
  }

  private jumpPreview() {
    const currentRef = this.getCurrentLineRef();
    const prevLineNumber = this.editor.getCursor().line - 1;
    for (let i = prevLineNumber; i > 0; i--) {
      const theLine = this.editor.getLine(i);
      if (theLine.match(currentRef)) {
        const linePartBeforeRef = theLine.match(RefUtil.lineWithRefPattern)[1];
        this.editor.setCursor({ line: i, ch: linePartBeforeRef.length + 1 });
        return;
      }
    }
    return;
  }

  private getCurrentLineRef() {
    const lineText = this.editorUtils.getLineContentUnderCursor();
    const match = lineText.match(RefUtil.lineWithRefPattern);
    return match[2];
  }

  private splitLineByCursor() {
    const cursorPosition = this.editor.getCursor();
    const lineText = this.editor.getLine(cursorPosition.line);
    const linePart1 = lineText.substring(0, cursorPosition.ch);
    const linePart2 = lineText.substring(cursorPosition.ch);
    return { linePart1, linePart2 };
  }

  private countCurrentNumber(): number {
    const markdownText = this.mdView.data;
    const match = markdownText.match(/==\d+-REF==/g);
    if (match === null) {
      return 1;
    }
    const numbers = match.map((it) => Number(it.substring(2, 3)));
    return Math.max(...numbers);
  }

  private hasRefInCurrentLine(): boolean {
    const lineText = this.editorUtils.getLineContentUnderCursor();
    const match = lineText.match(RefUtil.lineWithRefPattern);
    return match !== null;
  }
}
