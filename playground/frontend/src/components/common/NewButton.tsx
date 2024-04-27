export default function NewButton() {
  return (
    <>
      <span className="span-newButton">
        <img
          src="public/newFile.png"
          className="newButton"
          id="newFileButton"
        ></img>
        <img
          src="public/newFolder.png"
          className="newButton"
          id="newFolderButton"
        ></img>
      </span>
    </>
  );
}
