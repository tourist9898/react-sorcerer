import React, { useEffect, useRef, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "./DraftEditor.css";

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)));
    }
    return EditorState.createEmpty();
  });
  const editor = useRef(null);

  useEffect(() => {
    focusEditor();
  }, []);

  const focusEditor = () => {
    editor.current.focus();
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  const handleBeforeInput = (chars) => {
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const text = currentBlock.getText();
    const start = selectionState.getStartOffset();

    if (chars === "#" && start === 0) {
      const newEditorState = RichUtils.toggleBlockType(
        editorState,
        "header-one"
      );
      setEditorState(newEditorState);
      return "handled";
    }

    if (chars === "*" && start === 0) {
      const newEditorState = RichUtils.toggleInlineStyle(
        editorState,
        "BOLD"
      );
      setEditorState(newEditorState);
      return "handled";
    }
    if (chars === "**" && start === 0) {
      const newEditorState = RichUtils.toggleInlineStyle(
        editorState,
        "REDLINE"
      );
      setEditorState(newEditorState);
      return "handled";
    }

    // Handle '*** ' for underline
    if (chars === "***" && start === 0) {
      const newEditorState = RichUtils.toggleInlineStyle(
        editorState,
        "UNDERLINE"
      );
      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === "code-block") {
      return "code-block-style";
    }
    return null;
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentToSave = convertToRaw(contentState);
    localStorage.setItem("draftEditorContent", JSON.stringify(contentToSave));
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-container" onClick={focusEditor}>
        <Editor
          ref={editor}
          placeholder="Write Here"
          handleKeyCommand={handleKeyCommand}
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          blockStyleFn={blockStyleFn}
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default DraftEditor;
