

class answer
{
	constructor(xmlTree)
	{
		this.bCorrect = false;
		this.bIs_Scramblable = true;
		this.sText = new String();
		this.sID = new String();
		if (xmlTree != null && xmlTree !== undefined)
			this.Read_XML(xmlTree);
	}
	
	Read_XML (i_lpRoot_Element)
	{
		if (i_lpRoot_Element != null && i_lpRoot_Element.tagname == "choice")
		{
			this.sText = i_lpRoot_Element.innerText;
			i_lpRoot_Element.attributes.forEach(function (attribute, index) {
				if (attribute.name == "id")
				{
					this.sID = String(attribute.value);
				}
				else if (attribute.name == "scramble")
				{
					this.bIs_Scramblable = attribute.value == "true";

				}
				else if (attribute.name == "correct")
				{
					this.bCorrect = attribute.value == "true";
				}
			});
		}
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



