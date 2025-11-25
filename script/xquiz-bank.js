////////////////////////////////////////////////////////////////////////////////
// read a bank
////////////////////////////////////////////////////////////////////////////////

function createElement(tag, attribs)
{
	let element = document.createElement(tag);
	if (attribs !== null && attribs !== undefined)
	{
		let keys = Object.keys(attribs);
		keys.forEach( function(key, index)
		{
			element[key] = attribs[key];
		});
	}
	return element;
}
function duplicateElement(element)
{
	let domElement = document.createElement(element.nodeType);
	for (key in element)
	{
		if (key != "inner" && key != "nodeType" && key != "sourceElement") // special keys for the tokenElement
			domElement[key] = element[key];
	}
	fillInnerText(domElement, element.inner);
	return domElement;
}


function fillEquationText(topElement, classType, text)
{
	let eqSpan = createElement("span", {"className": classType});
	if (text != null && text != undefined)
	{
		eqSpan.innerText = "\\(" + text + "\\)";
		topElement.appendChild(eqSpan);
	}
}

function fillUnit(topElement, unitElement)
{
	let text = "\\mathrm{";
	let baseUnit = "";
	if (unitElement.nodeType == "meters")
		baseUnit = "m";
	else if (unitElement.nodeType == "grams")
		baseUnit = "g";
	else if (unitElement.nodeType == "seconds")
		baseUnit = "s";
	else if (unitElement.nodeType == "Newtons")
		baseUnit = "N";
	else if (unitElement.nodeType == "Joules")
		baseUnit = "J";
	else if (unitElement.nodeType == "Watts")
		baseUnit = "W";
	else if (unitElement.nodeType == "Kelvin")
		baseUnit = "K";
	else if (unitElement.nodeType == "Celsius")
	{
		baseUnit = "C";
		text += "{}^\\circ"
	}
	else if (unitElement.nodeType == "Coulombs")
		baseUnit = "C";
	else if (unitElement.nodeType == "Amperes")
		baseUnit = "A";
	else if (unitElement.nodeType == "Ohms")
		baseUnit = "\\Omega";
	else if (unitElement.nodeType == "Pascals")
		baseUnit = "Pa";
	else if (unitElement.nodeType == "Weber")
		baseUnit = "Wb";
	else if (unitElement.nodeType == "Hertz")
		baseUnit = "Hz";
	else if (unitElement.nodeType == "Henry")
		baseUnit = "H";
	else if (unitElement.nodeType == "Farad")
		baseUnit = "F";
	else if (unitElement.nodeType == "mole")
		baseUnit = "mol";
	else if (unitElement.nodeType == "candela")
		baseUnit = "cd";
	else if (unitElement.nodeType == "electromVolt")
		baseUnit = "eV";
	else if (unitElement.nodeType == "Volt")
		baseUnit = "V";
	else if (unitElement.nodeType == "Tesla")
		baseUnit = "T";
	else if (unitElement.nodeType == "lumen")
		baseUnit = "lm";
	else if (unitElement.nodeType == "lux")
		baseUnit = "lx";
	else if (unitElement.nodeType == "Bequerel")
		baseUnit = "Bq";
	else if (unitElement.nodeType == "Gray")
		baseUnit = "Gr";
	else if (unitElement.nodeType == "Sievert")
		baseUnit = "Sv";
	else if (unitElement.nodeType == "Siemens")
		baseUnit = "Sm";
	else if (unitElement.nodeType == "radians")
		baseUnit = "rad";
	else if (unitElement.nodeType == "steradians")
		baseUnit = "ster";
		
	if (unitElement.prefix != undefined && unitElement.prefix != null)
		text += unitElement.prefix;
	text += baseUnit;
	if (unitElement.power != undefined && unitElement.power != null && unitElement.power != 0 && unitElement.power != 1)
	{
		text += "^{" + unitElement.power + "}";
	}
	text += "}"
	fillEquationText(topElement,"units",text);
}
function fillInnerText(topElement, children)
{
	children.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "numref")
		{
			topElement.appendChild(createElement("span", {"className": "numref", innerText: "[ref: " + childElement.idref + "]" }));
//				topElement.appendChild(childElement.sourceElement);
		}
		else if (childElement.nodeType == "ref")
		{
			topElement.appendChild(createElement("span", {"className": "ref", innerText: "[ref: " + childElement.idref + "]" }));
//				topElement.appendChild(childElement.sourceElement);
		}
		else if (childElement.nodeType == "percnt")
		{
			topElement.appendChild(createElement("span", {innerText: "%" }));
		}
		else if (childElement.nodeType == "emdash")
		{
			topElement.appendChild(createElement("span", {innerText: "—" }));
		}
		else if (childElement.nodeType == "endash")
		{
			topElement.appendChild(createElement("span", {innerText: "–" }));
		}
		else if (childElement.nodeType == "meters" ||
			childElement.nodeType == "grams" ||
			childElement.nodeType == "seconds" ||
			childElement.nodeType == "Newtons" ||
			childElement.nodeType == "Joules" ||
			childElement.nodeType == "Watts" ||
			childElement.nodeType == "Kelvin" ||
			childElement.nodeType == "Celsius" ||
			childElement.nodeType == "Coulombs" ||
			childElement.nodeType == "Amperes" ||
			childElement.nodeType == "Ohms" ||
			childElement.nodeType == "Pascals" ||
			childElement.nodeType == "Weber" ||
			childElement.nodeType == "Hertz" ||
			childElement.nodeType == "Henry" ||
			childElement.nodeType == "Farad" ||
			childElement.nodeType == "mole" ||
			childElement.nodeType == "candela" ||
			childElement.nodeType == "electromVolt" ||
			childElement.nodeType == "Volt" ||
			childElement.nodeType == "Tesla" ||
			childElement.nodeType == "lumen" ||
			childElement.nodeType == "lux" ||
			childElement.nodeType == "Bequerel" ||
			childElement.nodeType == "Gray" ||
			childElement.nodeType == "Sievert" ||
			childElement.nodeType == "Siemens" ||
			childElement.nodeType == "radians" ||
			childElement.nodeType == "steradians")
		{
			fillUnit(topElement, childElement);
		}
		else if (childElement.nodeType == "kg")
		{
			fillEquationText(topElement,"units","\\mathrm{kg}");
		}
		else if (childElement.nodeType == "mps")
		{
			fillEquationText(topElement,"units","\\frac{\\mathrm{m}}{\\mathrm{s}}");
		}
		else if (childElement.nodeType == "mpss")
		{
			fillEquationText(topElement,"units","\\frac{\\mathrm{m}}{\\mathrm{s}^2}");
		}
		else if (childElement.nodeType == "kgmps")
		{
			fillEquationText(topElement,"units","\\frac{\\mathrm{kg}\;\\mathrm{m}}{\\mathrm{s}}");
		}
		else if (childElement.nodeType == "Nm")
		{
			fillEquationText(topElement,"units","\\mathrm{N}\\cdot\\mathrm{m}");
		}
		else if (childElement.nodeType == "Js")
		{
			fillEquationText(topElement,"units","\\mathrm{J}\\cdot\\mathrm{s}");
		}
		else if (childElement.nodeType == "equation")
		{
			if (childElement.inner.length == 1)
				fillEquationText(topElement,"equation",childElement.inner[0].value);
			// else - need to process HTML
		}
		else if (childElement.nodeType == "#PCDATA")
		{
			topElement.appendChild(childElement.sourceElement);
		}
		else if (childElement.nodeType == "imgref")
		{
			if (childElement.idref in g_imageDict)
			{
				const dictImage = g_imageDict[childElement.idref];
				let elem = createElement("img",null);
				if ("width" in childElement)
					elem.width = childElement.width;
				if ("height" in childElement)
					elem.height = childElement.height;
				if ("scale" in childElement)
					elem.style = childElement.style + "scale:" + childElement.scale + ";";
					
				if ("alt" in childElement)
					elem.alt = childElement.alt;
				else if ("alt" in dictImage)
					elem.alt = dictImage.alt;
					
				if ("longdesc" in childElement)
					elem.longdesc = childElement.longdesc;
				else if ("longdesc" in dictImage)
					elem.longdesc = dictImage.longdesc;
				
				elem.src = "data:image/" + dictImage.imagetype + ";base64, " + dictImage.contents;
				topElement.appendChild(elem);
			}
			else
			{
				console.error("unable to find " + childElement.idref + " in the image dictionary.");
			}

		}
		else
		{
			let newElem = duplicateElement(childElement);
			topElement.appendChild(newElem);
		}
	});
}

function createTable(baseid, colTitles, dataRows)
{
	let elemTable = null;
	if (dataRows !== null && dataRows !== undefined)
	{
		elemTable = createElement("table",{id: baseid + "-table"});
		
		if (colTitles !== null && colTitles !== undefined)
		{
			let elemTableHead = createElement("thead",{id: baseid + "-thead"});
			let elemTableHeadRow = createElement("tr",null);
			colTitles.forEach(function (title, index) {
			
				if (title instanceof Array && title[0] instanceof TokenElement)
				{
					let elemTH = createElement("th",{});
					fillInnerText(elemTH,title);
					elemTableHeadRow.appendChild(elemTH);
				}
				else if (title instanceof Element)
				{
					elemTableHeadRow.appendChild(title);
				}
				else
				{
					let elemTH = createElement("th",{innerText: title});
					elemTableHeadRow.appendChild(elemTH);
				}
			});
			elemTableHead.appendChild(elemTableHeadRow);
			elemTable.appendChild(elemTableHead);
		}
		
		let elemTableBody = createElement("tbody",{id: baseid + "-tbody"});


		dataRows.forEach(function(row, index) {
			let elemTableBodyRow = createElement("tr",null);
			if (row instanceof Array)
			{
				row.forEach(function(col, index) {
					if (col instanceof Array && col[0] instanceof TokenElement)
					{
						let elemTD = createElement("td",{});
						fillInnerText(elemTD,col);
						elemTableBodyRow.appendChild(elemTD);
					}
					else if (col instanceof Element)
					{
						elemTableHeadRow.appendChild(col);
					}
					else
					{
						let elemTD = createElement("td",{innerText: col});
						elemTableBodyRow.appendChild(elemTD);
					}
				});
			}
			else
			{
				let elemTD = createElement("td",{innerText: row});
				elemTableBodyRow.appendChild(elemTD);
			}
			elemTableBody.appendChild(elemTableBodyRow);
		});
		elemTable.appendChild(elemTableBody);
	}
	return elemTable;
}


let g_Banks = {};

function createPrompt(qid, element)
{
	let elemDetails = createElement("details", {id: qid + "-prompt-details"});

	let elemNew = createElement("summary", {id: qid + "-details-prompt-summary", innerText: "Prompt"});
	elemDetails.appendChild(elemNew);
	if (element.inner instanceof Array)
	{
		fillInnerText(elemDetails,element.inner);
	}
	return elemDetails;
}
function createChoice(element)
{
	return elemDetails;
}

function blankIfUndefined(value)
{
	if (value == undefined || value == null)
		return "";
	else
		return value;
}
function createChoices(qid,element)
{
	let elemDetails = createElement("details", {id: qid + "-choices-details"});

	let elemNew = createElement("summary", {id: qid + "-details-prompt-summary", innerText: "Choices"});
	elemDetails.appendChild(elemNew);
	if (element.inner instanceof Array)
	{
		let choices = new Array();
		
		element.inner.forEach(function (childElement, childIndex) {
			if (childElement.nodeType == "choice")
			{
				let row = [childElement.id, blankIfUndefined(childElement.weight), blankIfUndefined(childElement.correct), blankIfUndefined(childElement.scramble), blankIfUndefined(childElement.rank), childElement.inner];
				choices.push(row);
//				elemDetails.appendChild(childElement.sourceElement);
			}
			else if (childElement.nodeType == "choicenone")
			{
				let row = [childElement.id, blankIfUndefined(childElement.weight), blankIfUndefined(childElement.correct), blankIfUndefined(childElement.scramble), blankIfUndefined(childElement.rank), "None of the Above"];
				choices.push(row);
//				elemDetails.appendChild(childElement.sourceElement);
			}
			else if (childElement.nodeType == "choiceall")
			{
				let row = [childElement.id, blankIfUndefined(childElement.weight), blankIfUndefined(childElement.correct), blankIfUndefined(childElement.scramble), blankIfUndefined(childElement.rank), "All of the Above"];
				choices.push(row);
//				elemDetails.appendChild(childElement.sourceElement);
			}
			else if (childElement.nodeType == "choicesome")
			{
				let refs = childElement.refs.split(",");
				let refsString = ""
				refs.forEach( function (ref, refIndex) {
					if (refIndex > 0)
						refsString += ", ";
					if (refIndex == refs.length - 1)
					{
						if (childElement.conjunction == "andor")
							refsString += "and / or ";
						else
							refsString += childElement.conjunction.trim() + " ";
					}
					refsString += ref.trim();
				});
				let row = [childElement.id, blankIfUndefined(childElement.weight), blankIfUndefined(childElement.correct), blankIfUndefined(childElement.scramble), blankIfUndefined(childElement.rank), refsString];
				choices.push(row);
//				elemDetails.appendChild(childElement.sourceElement);
			}
			
		});
		let elemTable = createTable(qid + "-choices-details", ["ID", "Weight", "Correct", "Scramble", "Rank", "Choice"], choices);
		elemDetails.appendChild(elemTable);
		
		
	}
	return elemDetails;
}



function stringNullUndef(string)
{
	return (string === null || string === undefined) ? "" : string;
}

function addKeyEvent(event)
{
}


function createQuestion(element)
{
	let elemDetails = createElement("details", {id: element.id + "-details"});

	let elemNew = createElement("summary", {id: element.id + "-details-summary", innerText: "Question: " + element.id + " keys: " + element.keys});
	elemDetails.appendChild(elemNew);


	let attribsTable = createTable(element.id + "-attribs" ,["ID", "Difficulty", "Time Required"], [[element.id, stringNullUndef(element.difficulty), stringNullUndef(element.timerequired)]]);
	elemDetails.appendChild(attribsTable);

	elemDetails.appendChild(document.createElement("br"));

////////////////////////////////////////////////////
// edit section for keys
	let elemKeysDetails = createElement("details", {id: element.id + "-keys-details"});
	elemNew = createElement("summary", {id: element.id + "-keys-details-summary", innerText: "Keys"});
	elemKeysDetails.appendChild(elemNew);
	
	if (element.keys !== null && element.keys !== undefined)
	{
		let keys = element.keys.split(",");
		let keysTable = createTable(element.id + "-keys" ,["Key"], keys);
		elemKeysDetails.appendChild(keysTable);
	}
	
	elemNew = createElement("button",{id: element.id + "-key-add", idref: element.id, srcElem: element, "class": "addButton", value: "Add Key", innerText: "Add Key"});
	elemNew.addEventListener("click",addKeyEvent);
	elemKeysDetails.appendChild(document.createElement("br"));
	
	elemDetails.appendChild(elemKeysDetails);

	// group constants together
	let constants = [];
	element.inner.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "constant")
		{
			constants.push(childElement);
		}
	});
	if (constants.length > 0)
	{
		let elemConstantsDetails = createElement("details", {id: element.id + "-constants-details"});
		let elemConstantsSummary = createElement("summary", {id: element.id + "-constants-details-summary", innerText:"Constants"});
		elemConstantsDetails.appendChild(elemConstantsSummary);
		
		let tableRows = [];
		constants.forEach( function (constant) {
				tableRows.push([constant.id, constant.value]);
			});
		let elemTable = createTable(element.id + "-constants-details-table", ["ID", "Value"], tableRows);
		elemConstantsDetails.appendChild(elemTable);
		elemDetails.appendChild(elemConstantsDetails);
	}
	//@@TODO else still allow adding constants
	
	// group variables together
	let variables = [];
	element.inner.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "variable")
		{
			variables.push(childElement);
		}
	});
	if (variables.length > 0)
	{
		let elemConstantsDetails = createElement("details", {id: element.id + "-variables-details"});
		let elemConstantsSummary = createElement("summary", {id: element.id + "-variables-details-summary", innerText:"Variables"});
		elemConstantsDetails.appendChild(elemConstantsSummary);
		
		let tableRows = [];
		variables.forEach( function (variable) {
				tableRows.push([variable.id, variable.min, variable.max, variable.round, stringNullUndef(variable.dist), stringNullUndef(variable.units)]);
			});
		let elemTable = createTable(element.id + "-variables-details-table", ["ID", "Minimum", "Maximum", "Round To", "Distribution Type", "Units"], tableRows);
		elemConstantsDetails.appendChild(elemTable);
		elemDetails.appendChild(elemConstantsDetails);
	}
	//@@TODO else still allow adding variables

	// group variables together
	let calculations = [];
	element.inner.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "calculation")
		{
			calculations.push(childElement);
		}
	});
	if (calculations.length > 0)
	{
		let elemConstantsDetails = createElement("details", {id: element.id + "-calculations-details"});
		let elemConstantsSummary = createElement("summary", {id: element.id + "-calculations-details-summary", innerText:"Calculations"});
		elemConstantsDetails.appendChild(elemConstantsSummary);
		
		let tableRows = [];
		calculations.forEach( function (calculation) {
				tableRows.push([calculation.id, calculation.inner]);  // placeholder for calculation
			});
		let elemTable = createTable(element.id + "-calculations-details-table", ["ID", "Calculation"], tableRows);
		elemConstantsDetails.appendChild(elemTable);
		elemDetails.appendChild(elemConstantsDetails);
	}
	//@@TODO else still allow adding variables

	// prompt and choices
	element.inner.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "prompt")
		{
			let prompt = createPrompt(element.id,childElement);
			if (prompt !== null)
				elemDetails.appendChild(prompt);
		}
		else if (childElement.nodeType == "choices")
		{
			let choices = createChoices(element.id, childElement);
			elemDetails.appendChild(choices);
		}

	});
	return elemDetails;

}

function createGroup(element)
{
	let elemDetails = createElement("details", {id: element.id + "-details"});

	let elemNew = createElement("summary", {id: element.id + "-details-summary", innerText: "Group: " + element.id});
	elemDetails.appendChild(elemNew);
	
	element.inner.forEach(function (childElement, childIndex) {
		if (childElement.nodeType == "question")
		{
			elemDetails.appendChild(createQuestion(childElement));
		}
		else if (childElement.nodeType == "group")
		{
			elemDetails.appendChild(createGroup(childElement));
		}
	});

	return elemDetails;
}
function addConstantEvent(event)
{
}
let g_ImagePath = null;
let g_imageDict = {};

function  displayBank(id)
{
	let bank = g_Banks[id].tokenized;

	let div = document.getElementById("div-imagedict");
	div.innerHTML = '';
	
	let elemDetails = createElement("details", {id: bank.id + "-image-dict"});
	let elemNew = createElement("summary",{id: bank.id + "-image-dict-summary", innerText: "Image Dictionary"});
	elemDetails.appendChild(elemNew);
	// read image dictionary
	bank.inner.forEach(function(element, index) {
		if (element.nodeType =="imagedict")
		{
			g_ImagePath = element.imagepath;
			element.inner.forEach(function (image, imindex) {
				if (image.nodeType == "image")
				{
					const contents = image.inner[0].value;
					if (image.inner.length > 0)
						g_imageDict[image.id] = {alt: image.alt, longdesc: image.longdesc, id: image.id, imagetype: image.imagetype, src:image.src, contents: contents};
					let imgDetail = createElement("details", {id: bank.id + "-image-" + image.id});
					let imgSummary = createElement("summary",{id: bank.id + "-image-" + image.id + "summary", innerText: image.id});
					imgDetail.appendChild(imgSummary);
					
					let fig = createElement("p",{});
					let imgImg = createElement("img", {src: "data:image/" + image.imagetype + ";base64, " + contents});
					fig.appendChild(imgImg);
					imgDetail.appendChild(fig);
					
					elemDetails.appendChild(imgDetail);
				}
			});
		}
	});
	div.appendChild(elemDetails);


	div = document.getElementById("div-constants");
	div.innerHTML = '';
	// Display all constants
	
	elemDetails = createElement("details", {id: bank.id + "-detail-constants"});

	elemNew = createElement("summary",{id: bank.id + "-constants-details-summary", innerText: "Constants"});
	elemDetails.appendChild(elemNew);
	
	let consts = new Array();
	
	bank.inner.forEach(function(element, index) {
		if (element.nodeType =="constant")
		{
			const constData = [element.id, element.value];
			consts.push(constData);
		}
	});

	let elemTable = createTable(bank.id + "-constants-details" , ["ID", "Value"], consts);
	if (elemTable != null)
		elemDetails.appendChild(elemTable);
	elemDetails.appendChild(document.createElement("br"));
	
	elemNew = createElement("button",{id: bank.id + "-constant-add", idref: bank.id, srcElem: bank, "class": "addButton", value: "Add Constant", innerText: "Add Constant"});
	elemNew.addEventListener("click",addConstantEvent);
	elemDetails.appendChild(elemNew);
	elemDetails.appendChild(document.createElement("br"));

	div.appendChild(elemDetails);

	
	// Display all groups
	
	div = document.getElementById("div-groups");
	div.innerHTML = '';
	// Display all groups
	bank.inner.forEach(function(element, index) {
		if (element.nodeType =="group")
		{
			div.appendChild(createGroup(element));
		}
	});
	


    // After updating innerHTML
    MathJax.typesetPromise().then(() => {
        console.log('MathJax typesetting complete for new content.');
    }).catch((err) => {
        console.error('MathJax typesetting failed:', err);
    });

}
let xsd_xquiz_HTML = null;
let xsd_xquiz_bank = null;

async function loadSchema()
{
	const xsd_xquiz_HTML_url = "https://raw.githubusercontent.com/astrobit/xquiz/refs/heads/master/docs/xquiz-html-1.0.0.xsd";
	try
	{
		const response = await fetch(xsd_xquiz_HTML_url);
		if (!response.ok)
		{
			throw new Error(`Response status: ${response.status}`);
		}

		xsd_xquiz_HTML = await response.text();
	} 
	catch (error)
	{
		console.error(error.message);
	}

	const xsd_xquiz_bankL_url = "https://raw.githubusercontent.com/astrobit/xquiz/refs/heads/master/docs/xquiz-bank-2.0.0.xsd";
	try
	{
		const response = await fetch(xsd_xquiz_bankL_url);
		if (!response.ok)
		{
			throw new Error(`Response status: ${response.status}`);
		}

		xsd_xquiz_bank = await response.text();
	} 
	catch (error)
	{
		console.error(error.message);
	}
}
loadSchema();


function readBank(file)
{
	const reader = new FileReader();
	reader.onload = function(e) {
			const parser = new DOMParser();
			//@@TODO: Validate the xml using the loaded schema.
			// xmllint requires additional files that aren't readily available.
/*			if (xsd_xquiz_HTML != null && xsd_xquiz_bank != null)
			{
				let lintObj = {
					xml: e.target.result,
					schema: [xsd_xquiz_HTML,xsd_xquiz_bank]
				};
				const validation = xmllint.validateXML(lintObj);
				
				if (validation.errors)
				{
					console.log(validation.errors);
				}
	//there were no errors.
			}*/
			
			const doc = parser.parseFromString(e.target.result, 'text/xml');
			if (doc.getElementsByTagName("parsererror").length > 0)
				console.error(doc.getElementsByTagName("parsererror")[0]);
			const bankElement = doc.children[0]; // get top level element of the bank
			g_Banks[bankElement.id] = {xml: bankElement, tokenized: new TokenElement(bankElement)};
			displayBank(bankElement.id);
		}
	reader.readAsText(file);
}

