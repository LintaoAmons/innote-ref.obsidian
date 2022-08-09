import {MarkdownView, Plugin} from "obsidian";

export default class MyPlugin extends Plugin {
    private lineWithRefPattern = /(.*)(==\d+-REF==).*/;
    private mdView = this.app.workspace.getActiveViewOfType(MarkdownView)
    private editor = this.app.workspace.getActiveViewOfType(MarkdownView).editor;

    async onload() {
        this.addCommand({
            id: "insert-or-jump-to-next",
            name: "Insert or Jump to next ref",
            checkCallback: (checking: boolean) => {
                if (checking)
                    return !!this.app.workspace.getActiveViewOfType(MarkdownView);
                this.insertOrJump();
            },
        });
        this.addCommand({
            id: "jump to preview",
            name: "Jump to previews",
            checkCallback: (checking: boolean) => {
                if (checking)
                    return !!this.app.workspace.getActiveViewOfType(MarkdownView);
                this.jumpPreview();
            }
        })
    }

    private insertOrJump() {
        if (this.hasRefInCurrentLine()) {
            this.jumpToNextRef()
        } else {
            this.insertInPlace()
        }
    }

    private insertInPlace() {
        const cursorPosition = this.editor.getCursor();
        const lineText = this.editor.getLine(cursorPosition.line);
        const {linePart1, linePart2} = this.splitLineByCursor()
        const currentNumber = this.countCurrentNumber()
        const newLine = `${linePart1} ==${currentNumber}-REF== ${linePart2}`;

        this.editor.replaceRange(
            newLine,
            {line: cursorPosition.line, ch: 0},
            {line: cursorPosition.line, ch: lineText.length}
        );
        this.editor.setCursor(cursorPosition);
    }

    private jumpToNextRef() {
        const currentRef = this.getCurrentLineRef()
        const nextLineNumber = this.editor.getCursor().line + 1;
        for (let i = nextLineNumber; i < this.editor.lineCount(); i++) {
            const theLine = this.editor.getLine(i);
            if (theLine.match(currentRef)) {
                const linePartBeforeRef = theLine.match(this.lineWithRefPattern)[1]
                this.editor.setCursor({line: i, ch: linePartBeforeRef.length + 1});
                return;
            }
        }
        return;
    }

    private jumpPreview() {
        const currentRef = this.getCurrentLineRef()
        const prevLineNumber = this.editor.getCursor().line - 1;
        for (let i = prevLineNumber; i > 0; i--) {
            const theLine = this.editor.getLine(i);
            if (theLine.match(currentRef)) {
                const linePartBeforeRef = theLine.match(this.lineWithRefPattern)[1]
                this.editor.setCursor({line: i, ch: linePartBeforeRef.length + 1});
                return;
            }
        }
        return;
    }

    private getCurrentLineRef() {
        const lineText = this.getCurrentLine();
        const match = lineText.match(this.lineWithRefPattern);
        return match[2]
    }

    private splitLineByCursor() {
        const cursorPosition = this.editor.getCursor();
        const lineText = this.editor.getLine(cursorPosition.line);
        const linePart1 = lineText.substring(0, cursorPosition.ch);
        const linePart2 = lineText.substring(cursorPosition.ch);
        return {linePart1, linePart2}
    }

    private countCurrentNumber() {
        const markdownText = this.mdView.data;
        const match = markdownText.match(/==\d+-REF==/g)
        if (match === null) {
            return 1
        }
        const numbers = match.map(it => Number(it.substring(2, 3)));
        return Math.max(...numbers);
    }

    private hasRefInCurrentLine(): boolean {
        const lineText = this.getCurrentLine()
        const match = lineText.match(this.lineWithRefPattern);
        return match !== null;
    }

    private getCurrentLine() {
        const cursorPosition = this.editor.getCursor(); // 光标现在的位置
        return this.editor.getLine(cursorPosition.line); // 这一行的文本
    }
}
