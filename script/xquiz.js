class TokenElement
{
	constructor(element)
	{
		this.inner = new Array();
		this.nodeType = null;
		if (element != null && element != undefined)
		{
			if (element instanceof HTMLCollection || element instanceof Element)
			{
				if (element.tagName == "#PCDATA")
					console.log(element);
				this.nodeType = element.tagName;
				for (let index = 0; index < element.attributes.length; index++)
				{
					const attrib = element.attributes[index];
					this[attrib.name] = attrib.value;
				}
				for (let index = 0; index < element.childNodes.length; index++)
				{
					const child = element.childNodes[index];
					if (child instanceof Text)
					{
						let value = child.nodeValue.trim();
						if (value != "")
						{
							this.inner.push(new TokenElement(child));
						}
					}
					else
					{
						this.inner.push(new TokenElement(child));
					}
				}
				this.sourceElement = element;
			}
			else if (element instanceof Text)
			{
				this.nodeType = "#PCDATA";
				this.value = element.nodeValue.trim();
				this.sourceElement = element;
			}
		}
	}
}

class InstanceData
{
}

class variableInstance
{
	constructor(element)
	{
		this.id = element.id;
		this.min = element.min;
		this.max = element.max;
		this.functiontype = element.functiontype;
		this.precision = element.precision;
		this.stdev = element.stdev;
		this.requirescientific = element.requirescientific;
		
		let value = (this.max + this.min) * 0.5;
		if (this.functiontype == "gaussian")
		{
			value = random_gaussian((this.max + this.min) * 0.5,this.stdev);
		}			
		else if (this.functiontype == "tophat")
		{
			value = (this.max - this.min) * Math.random() + this.min;
		}
		let rndValue = Math.pow(10.0,-this.precision);
		this.value = Math.round(value / rndValue) * rndValue;
		let log_value = Math.log10(Math.abs(this.value));
		if (this.requirescientific || Math.abs(log_value) >= 3.0)
		{
			this.serialLaTeX = serializeLaTeXscientific(this.value,this.precision)
		}
		else
		{
			this.serialLaTeX = this.value.toFixed(Math.max(0,this.precision));
		}
	}
	serializeLatex()
	{
		return this.serialLaTeX;		
	}
}
class calculation
{
	constructor(element)
	{
		this.id = element.id;
		this.inner = element.inner;
		this.value = null;
		this.precision = element.precision;
	}
	resetValue()
	{
		this.value = null;
	}
	calculate(instancedata,force)
	{
		if (this.value == null || force)
		{
			let calcstring = new String();
			inner.forEach(function (element, index) {
				if (element.nodeType == '#PCDATA')
				{
					calcstring += element.value;
				}
				else if (element.nodeType == 'varref')
				{
					let variable = instance.data[element.id];
					calcstring += variable.value;
				}
				else if (element.nodeType == 'calcref')
				{
					if (element.id != this.id)
					{
						error.log ("self referening calculaiton " + this.id);
					}
					else
					{
						let calculation = instance.data[element.id];
						
						calcstring += calculation.calculate();
					}
				}
			});
			this.value = math.evaluate(calcstring.toString());
			if (this.requirescientific || Math.abs(log_value) >= 3.0)
			{
				this.serialLaTeX = serializeLaTeXscientific(this.value,this.precision)
			}
			else
			{
				this.serialLaTeX = this.value.toFixed(Math.max(0,this.precision));
			}
		}
		return this.value;
	}
	serializeLatex()
	{
		return this.serialLaTeX;		
	}
}

////////////////////////////////////////////////////////////////////////////////
// function to interpret a variable that may contain a number as a string to a number
////////////////////////////////////////////////////////////////////////////////

function varToNumber(data)
{
	let out = null;
	if (typeof data == "number")
		out = data;
	else if ((typeof data == "string") || (data instanceof String))
		out = Number(data);
	return out;
	
}



class answer
{
	constructor(xmlTree)
	{
		this.bCorrect = false;
		this.bIs_Scramblable = true;
		this.vInner = new Array();
		this.sID = new String();
		if (xmlTree != null && xmlTree !== undefined)
			this.Read_XML(xmlTree);
	}
	
	Read_XML (i_lpRoot_Element)
	{
		let element = new tokencomponent(i_lpRoot_Element);
		if (element.nodeType == "choice")
		{
			this.vInner = element.inner;
			this.sID = String(element.id);
			this.bIs_Scramblable = element.scramble == "true";
			this.bCorrect = element.correct == "true";
		}
	}
	
	serializeLaTeX()
	{
		let out = new String();
		if (bCorrect)
			out += "\\CorrectChoice";
		else
			out += "\\Choice";
		
	}

}
class answer_none extends answer
{
	constructor(xmlTree)
	{
		super();
		this.bIs_Scramblable = false;
		this.Read_XML(xmlTree);
	}
	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "choicenone")
		{
			this.sText = String("None of the above.");
			i_lpRoot_Element.attributes.forEach(function (attribute, index) {
				if (attribute.name == "id")
				{
					this.sID = String(attribute.value);
				}
				else if (attribute.name == "correct")
				{
					this.bCorrect = attribute.value == "true";
				}
			});
		}
	}
}
class answer_all extends answer
{
	constructor(xmlTree)
	{
		super();
		this.bIs_Scramblable = false;
		this.Read_XML(xmlTree);
	}
	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "choiceall")
		{
			this.sText = String("All of the above.");
			i_lpRoot_Element.attributes.forEach(function (attribute, index) {
				if (attribute.name == "id")
				{
					this.sID = String(attribute.value);
				}
				else if (attribute.name == "correct")
				{
					this.bCorrect = attribute.value == "true";
				}
			});
		}
	}
}
class answer_some extends answer
{
	constructor(xmlTree)
	{
		super();
		this.szConjuction = "and";
		this.bIs_Scramblable = false;
		this.Read_XML(xmlTree);
	}
	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "choicesome")
		{
			i_lpRoot_Element.attributes.forEach(function (attribute, index) {
				if (attribute.name == "id")
				{
					this.sID = String(attribute.value);
				}
				else if (attribute.name == "correct")
				{
					this.bCorrect = attribute.value == "true";
				}
				else if (attribute.name == "refs")
				{
					this.sRefs = String(attribute.value);
				}
				else if (attribute.name == "conjunction")
				{
					if (attribute.value == "or")
						this.szConjuction = "or";
					else if (attribute.value == "andor")
						this.szConjuction = "and/or";
				}
			});
			let refs = this.sRefs.split(",");
			let finalRefs = new Array();
			refs.forEach(function (ref, index){
				let refsplit = ref.split(" ");
				refsplit.forEach(function (refspace, index2) {
					let refsplitsplit = refspace.split("\t");
					refsplitsplit.forEach(function (reffinal, index3) {
						finalRefs.push(reffinal.trim());
					});
				});
			});
			this.sText = new String();
			finalRefs.forEach(function (ref, index) {
				if (index > 0 && index != (finalRefs.length) - 1)
					this.sText.concat(",");
				else if (index == (finalRefs.length - 1))
					this.sText.concat(" " + szConjuction);
				this.sText.concat(" \\ref{" + ref + "}");
			});
		}
	}
}


class question
{
	constructor(xmlTree)
	{
		this.vaAnswers = new Array();
		this.mAnswers = new Object();
		this.vKeys = new Array();
		
		this.sID = new String();
		this.sPrompt = new String();
		this.bScramble_Answers = true;
		this.sNote = new String();
		if (xmlTree != null && xmlTree !== undefined)
			this.Read_XML(xmlTree);
	}
	
	parse_keys(i_sKeys)
	{
		this.vKeys = new Array();
		let keylist = i_sKeys.split(",");
		keylist.forEach(function (key, index) {
			this.vKeys.push(key.trim());
		});
	}


	add_answer(i_cAnswer)
	{
		this.mAnswers[i_cAnswer.sID] = this.vaAnswers.length;
		this.vaAnswers.push(i_cAnswer);
	}
	find_answer(sID)
	{
		let cRet = null;
		if (sID in this.mAnswers)
		{
			cRet = this.vaAnswers[mAnswers[sID]];
		}
		return cRet;
	}
	num_answers()
	{
		return this.vaAnswers.length;
	}
	get_answer(i_tIdx)
	{
		let cRet = null;
		if (i_tIdx < this.vaAnswers.length)
			cRet = this.vaAnswers[i_tIdx];
		return cRet;
	}
	
	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "question")
		{
			i_lpRoot_Element.attributes.forEach(function (attribute, aindex) {
				if (attribute.name == "id")
				{
					this.sID = String(attribute.value);
				}
				else if (attribute.name == "keys")
				{
					parse_keys(attribute.value);
				}
			});
			
			i_lpRoot_Element.children.forEach(function (element, eindex) {
				if (element.tagname == "prompt")
					this.sPrompt = element.innerText;
				else if (element.tagname == "note")
					this.sNote = element.innerText;
				else if (element.tagname == "choices")
				{
					element.attributes.forEach(function (attribute, aindex) {
						if (attribute.name == "scramble")
						{
							this.bScramble_Answers = attribute.value == "true";
						}
					});
					element.children.forEach(function (choiceelem, ceindex) {
						let bCorrect_Answer = false;
						if ((choiceelemt.tagname == "choice") || (choiceelemt.tagname == "choicenone") || (choiceelemt.tagname == "choiceall") || (choiceelemt.tagname == "choicesome"))
						{
							let answerData = new answer(choiceelement);
							bCorrect_Answer |= answerData.bCorrect;
							this.add_answer(answerData);
						}
						if (!bCorrect_Answer)
							console.log("Warning: no correct answer listed for " + this.sID);
					});
				}
			});
		}
	}
}


class bank
{
	constructor(xmlTree)
	{
		this.vQuestion_Bank = new Object();
		this.Read_XML(xmlTree);
	}

	add(i_cQuestion)
	{
		this.vQuestion_Bank[i_cQuestion.sID] = i_cQuestion;
	}
	getQuestion (sID)
	{
		return this.vQuestion_Bank[sID];
	}
	question_exists(i_sID) 
	{
		return (i_sID in this.vQuestion_Bank);
	}
	addBank(bank)
	{
		for (let question in bank.vQuestion_Bank)
		{
			this.add(question);
		}
	}
	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "bank")
		{
			i_lpRoot_Element.children.forEach(function (element, index) {
				if (element.tagname == "question")
				{
					add(new question(element));
				}
			}); // while bank children
		} // if bank
	}

};

class quiz
{
	Parse_Questions_XML(i_lpRoot_Element)
	{
		let  cQ_List = new Array();
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "questions")
		{
			i_lpRoot_Element.children.forEach(function (element, index) {
				if (element.tagname == "qref")
				{
					element.attributes.forEach(function (attribute, aindex) {			
						if (attribute.name == "id")
						{
							cQ_List.push(attribute.value);
						}
					});
				}
			});
		} // if node  
		return cQ_List;
	}
	constructor(xmlTree)
	{
		this.sTitle = new String();
		this.sDate = new String();
		this.sInstructions = new String();
		this.cBank = new Bank();
		this.vsQuestion_IDs = new Array();
		this.Read_XML(xmlTree);
	}
	Validate_Questions()
	{
		vsQuestion_IDs.forEach(function (qid, index) {
			if (cBank.question_exists(qid) != 1)
				console.log("Unable to find question with ID " + qid + " in bank.");
		});
	}

	Read_XML(i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "quiz")
		{
			i_lpRoot_Element.children.forEach(function (element, index) {
				if (element.tagname == "title")
					this.sTitle = element.innerText;
				else if (element.tagname == "date")
					this.sDate = element.innerText;
				else if (element.tagname == "datealt")
				{
					let sDay, sMonth, sYear;
					element.attributes.forEach(function (attribute, aindex) {
						if (attribute.name == "day")
							sDay = attribute.value;
						else if (attribute.name == "month")
							sMonth = attribute.value;
						else if (attribute.name == "year")
							sYear = attribute.value;
					});
					this.sDate = sDay + "~" + sMonth + "~" + sYear;
				}
				else if (element.tagname == "instructions")
				{
					this.sInstructions = element.innerText;
				}
				else if (element.tagname == "bank")
				{
					this.cBank = new bank(element);
				}
				else if (element.tagname == "questions")
				{
					this.vsQuestion_IDs = this.Parse_Questions_XML(element);
				}
				else if (element.tagname == "bankref")
				{
					let sBank_File;
					element.attributes.forEach( function (attribute, aindex) {
						if (attribute.name == "file")
							sBank_File = attribute.value;
					});
					if (sBank_File != null && sBank_File != undefined)
					{
						const reader = new FileReader();
						reader.onload = function(e) { 
							parser = new DOMParser();
							xmlDoc = parser.parseFromString(e,"text/xml");
							let newBank = new bank(xmlDoc.getElementsByTagName("bank")[0]);
							this.cBank.addBank(newBank);
							};
						reader.readAsText(sBank_File);
					}
				}
			});
		} // if ..
		this.Validate_Questions();
	}
};

class question_instance
{
	constructor()
	{
		this.sID = new String();
		this.sAnswer_IDs = new Array();
	}
};

class quiz_instance
{
	Generate_Instance(i_cQuiz, i_bScramble_Questions, i_bScramble_Answers)
	{
		let mapQuestions = new Object();
		let tOrder = 1;

		for (let tI = 0; tI < i_cQuiz.vsQuestion_IDs.length; tI++)
		{
			let cQuest = i_cQuiz.cBank.get(i_cQuiz.vsQuestion_IDs[tI]);
			let qCurr = new question_instance();
			qCurr.sID = cQuest.sID;
			if (this.i_bScramble_Answers && cQuest.bScramble_Answers)
			{
				let mapAnswers = new Object();
				for (let tJ = 0; tJ < cQuest.num_answers(); tJ++)
				{
					if (cQuest.get_answer(tJ).bIs_Scramblable)
					{
						mapAnswers[Math.random()] = cQuest.get_answer(tJ).sID;
					}

				}
				let MapAnswersKey = Object.keys(mapAnswers);
				let iterK = 0;
				for (let tJ = 0; tJ < cQuest.num_answers(); tJ++)
				{
					if (cQuest.get_answer(tJ).bIs_Scramblable)
					{
						const key = MapAnswersKey[iterK];
						
						qCurr.sAnswer_IDs.push(mapAnswers[key]);
						iterK++;
					}
					else
					{
						qCurr.sAnswer_IDs.push(cQuest.get_answer(tJ).sID);
					}
				}

			}
			else
			{
				for (let tJ = 0; tJ < cQuest.num_answers(); tJ++)
				{
					qCurr.sAnswer_IDs.push(cQuest.get_answer(tJ).sID);
				}
			}
			let tCurr_Num = tOrder;
			if (i_bScramble_Questions)
				tCurr_Num = Math.random()
			mapQuestions[tCurr_Num] = qCurr;
			tOrder++;
		}
		let MapAnswersKey = Object.keys(mapAnswers);
		for (let iterI = 0; iterI != MapAnswersKey.length; iterI++)
		{
			this.vQuestions.push(mapQuestions[MapAnswersKey[iterI]]);
		}
	}	
	constructor(i_cQuiz, i_bScramble_Questions, i_bScramble_Answers)
	{
		this.vQuestions = new Array();
		this.Generate_Instance(i_cQuiz, i_bScramble_Questions, i_bScramble_Answers);
	}
};

let xsd_xquiz_HTML = null;
let xsd_xquiz_bank = null;
let xsd_xquiz_quiz = null;
let xsd_xquiz_quiz_instance = null;

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

	const xsd_xquiz_bank_url = "https://raw.githubusercontent.com/astrobit/xquiz/refs/heads/master/docs/xquiz-bank-2.0.0.xsd";
	try
	{
		const response = await fetch(xsd_xquiz_bank_url);
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
	const xsd_xquiz_quiz_url = "https://raw.githubusercontent.com/astrobit/xquiz/refs/heads/master/docs/xquiz-2.0.0.xsd";
	try
	{
		const response = await fetch(xsd_xquiz_quiz_url);
		if (!response.ok)
		{
			throw new Error(`Response status: ${response.status}`);
		}

		xsd_xquiz_quiz = await response.text();
	} 
	catch (error)
	{
		console.error(error.message);
	}
	const xsd_xquiz_quiz_instance_url = "https://raw.githubusercontent.com/astrobit/xquiz/refs/heads/master/docs/xquiz-instance-1.0.0.xsd";
	try
	{
		const response = await fetch(xsd_xquiz_quiz_instance_url);
		if (!response.ok)
		{
			throw new Error(`Response status: ${response.status}`);
		}

		xsd_xquiz_quiz_instance = await response.text();
	} 
	catch (error)
	{
		console.error(error.message);
	}
}
loadSchema();


function readFile(file)
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
			const rootElement = doc.children[0]; // get top level element of the bank
			if (rootElement instanceof HTMLCollection || rootElement instanceof Element)
			{
				if (rootElement.tagName == "bank")
				{
					g_Banks[rootElement.id] = {xml: rootElement, tokenized: new TokenElement(rootElement)};
					displayBank(rootElement.id);
				}
				else if (rootElement.tagname == "xq:activity")
				{
					g_Quizzes[rootElement.id] = {xml: rootElement, tokenized: new TokenElement(rootElement)};
					displayQuiz(rootElement.id);
				}
				else if (rootElement.tagname == "xqi:activity")
				{
					g_Quiz_Instances[rootElement.id] = {xml: rootElement, tokenized: new TokenElement(rootElement)};
					displayQuizInstance(rootElement.id);
				}
			}
		}
	reader.readAsText(file);
}



