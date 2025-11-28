

const inputElement_Bankfile = document.getElementById("Bank file");
inputElement_Bankfile.addEventListener("change", handleFilesBank);

function handleFilesBank()
{
//	const fileList = this.files; /* now you can work with the file list */
	for (const file of this.files)
	{
		readFile(file);
	}
}


