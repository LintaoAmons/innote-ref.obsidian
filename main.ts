import {Editor, MarkdownView, Plugin} from "obsidian";

export default class MyPlugin extends Plugin {
    private refPattern = /==REF-\d+==/;

    async onload() {
        this.addCommand({
            id: "insert-or-jump",
            name: "Insert or Jump to next ref",
            checkCallback: (checking: boolean) => {
                if (checking)
                    return !!this.app.workspace.getActiveViewOfType(MarkdownView);
                this.insertOrJump();
            },
        });
    }

    private insertOrJump() {
        const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

        if (!mdView) return false;
        if (mdView.editor == undefined) return false;

        const doc = mdView.editor;
        const cursorPosition = doc.getCursor(); // 光标现在的位置
        const lineText = doc.getLine(cursorPosition.line); // 这一行的文本
        // const markdownText = mdView.data; // markdown 所有的文本

        if (this.hasRefInCurrentLine(lineText)) {
            this.jumpToNextRef(lineText, doc)
        } else {
            this.createRef(lineText, doc)
        }

    }

    private hasRefInCurrentLine(lineText: string): boolean {
        const match = lineText.match(this.refPattern);
        return match !== null;
    }

    private jumpToNextRef(lineText: string, doc: Editor) {
        const match = lineText.match(this.refPattern);
        const currentRef = match[0]
        const nextLineNumber = doc.getCursor().line + 1;
        for (let i = nextLineNumber; i < doc.lineCount(); i++) {
            const theLine = doc.getLine(i);
            if (theLine.match(currentRef)) {
                doc.setCursor({line: i, ch: 0});
                return;
            }
        }
        return;
    }

    private createRef(
        lineText: string,
        doc: Editor,
    ) {
        const cursorPosition = doc.getCursor()
        let footnoteMarker = `==REF-1==`;
        let linePart1 = lineText.substr(0, cursorPosition.ch);
        let linePart2 = lineText.substr(cursorPosition.ch);
        let newLine = linePart1 + footnoteMarker + linePart2;

        doc.replaceRange(
            newLine,
            {line: cursorPosition.line, ch: 0},
            {line: cursorPosition.line, ch: lineText.length}
        );
    }
}
