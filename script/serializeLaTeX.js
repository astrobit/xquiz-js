


////////////////////////////////////////////////////////////////////////////////
// render a number in scientific notation in latex
////////////////////////////////////////////////////////////////////////////////
function serializeLaTeXscientific(value, precision)
{
	let ret = new String();
	if (value != 0)
	{
		const log_value = Math.log10(Math.abs(value));
		const sign = (value < 0);
		const power = Math.pow(10.0,-Math.floor(log_value));
		const exp = Math.floor(log_value);
		
		const mantissa = value * power;
		const rounding = Math.max(0,precision);
		
	//			return "(" + this.value_string + " \u00b1 " + this.uncertainty_string + ")";
		ret += mantissa.toFixed(rounding) + "\\times 10^{" + exponent + "}";
	}
	return ret;
}


/// very limited set of font options.
// this converts a font specific in an HTML style to the 
// corresponding LaTeX font famliy code
const fontfamilyCode = {
	"Times" : "ptm",
	"Times New Roman" : "ptm",
	"Serif" : "ptm",
	"Courier" : "pcr",
	"Sans-Serif" : "cmss",
	"Sans" : "cmss",
	"Arial" : "cmss",
	"Helvetica" : "cmss"
};
	

////////////////////////////////////////////////////////////////////////////////
// This function interprets style information from an element or element and
// stylesheet. This doesn't handle all possible stylesheet styles, and probably
// doesn't quite handle all possible classes and stylesheet instances
//@@TODO better handle CSS
////////////////////////////////////////////////////////////////////////////////
function serializeStyleLatexPrefix(element,stylesheet)
{
	let styles = "";
	let prefix = "";
	let postfix = "";
	
	if ("style" in element)
	{
		styles += element.style;
	}
	
	const classname = ("class" in element) ? "."+element.class : null;
	if (classname !== null && classname in stylesheet)
		styles += stylesheet[classname].style;
	if (element.nodeType in stylesheet)
	{
		styles += stylesheet[nodeType].style;
		const classname = ("class" in element) ? "."+element.class : null;
		if (classname !== null && classname in stylesheet[nodeType])
			styles += stylesheet[nodeType][classname].style;
	}
		
	const styleset = styles.split(";");
	let backgroundcolor = null
	let color = null;
	let fontfamliy = null;
	let fontsize = null;
	let textalign = null;
	
	styleset.forEach (function (styleText,index){
		let parts = styleText.split(":");
		let style = parts.length > 0 ? parts[0].trim() : null;
		let value = parts.length > 1 ? parts[1].trim() : null;
		if (style == "background-color")
			backgroundcolor = value;
		else if (style == "color")
			color = value;
		else if (style == "font-family")
			fontfamily = value;
		else if (style == "font-size")
			fontsize = value;
		else if (style == "text-align")
			textalign = value;
	}
	
	if (backgroundcolor != null)
	{
		prefix += "\\colorBox{" + backgroundcolor + "}{";
		postfix += "}"
	}
	if (color !== null || fontfamliy !== null || fontsize !== null || textalign != null)
	{
		prefix += "{";
		postfix += "}"
	}	
	
	if (color !== null)
	{
		prefix += "\\color{" + color + "} ";
	}

	if (fontfamliy !== null)
	{
		prefix += "\\fontfamily{" + fontfamilyCode[fontfamliy] + "}\\selectfont ";
	}

	if (fontsize !== null)
	{
		if (fontsize == "xx-small")
			prefix += "\\tiny "
		else if (fontsize == "x-small")
			prefix += "\\scriptsize"
		else if ((fontsize == "small") || (fontsize == "smaller"))
			prefix += "\\small "
		else if (fontsize == "medium")
			prefix += "\\normalsize "
		else if ((fontsize == "large") || (fontsize == "larger"))
			prefix += "\\Large "
		else if (fontsize == "x-large")
			prefix += "\\huge "
		else if (fontsize == "xx-large")
			prefix += "\\Huge "
		else
		{
			// need to interpret
			// these ranges are rough approximations of what the correct scaling should be
			if (fontsize.endsWith("%"))
			{
				let value = Math.abs(Number(fontsize));
				if (value <= 40)
					prefix += "\\tiny ";
				else if (value <= 60)
					prefix += "\\scriptsize ";
				else if (value <= 80)
					prefix += "\\footnotesize ";
				else if (value <= 120)
					prefix += "\\normalsize ";
				else if (value <= 140)
					prefix += "\\large ";
				else if (value <= 160)
					prefix += "\\Large ";
				else if (value <= 180)
					prefix += "\\LARGE ";
				else if (value <= 200)
					prefix += "\\huge ";
				else
					prefix += "\\Huge ";
				
			}
			else if ((fontsize.endsWith("rem") || (fontsize.endsWith("em"))
			{
				let value = Number(fontsize);
				if (value <= -6)
					prefix += "\\tiny ";
				else if (value <= -4)
					prefix += "\\scriptsize ";
				else if (value <= -2)
					prefix += "\\footnotesize ";
				else if (value <= 0)
					prefix += "\\normalsize ";
				else if (value < 2)
					prefix += "\\large ";
				else if (value < 4)
					prefix += "\\Large ";
				else if (value < 6)
					prefix += "\\LARGE ";
				else if (value < 8)
					prefix += "\\huge ";
				else
					prefix += "\\Huge ";
			}
			else if (fontsize.endsWith("px"))
			{
				let value = Math.abs(Number(fontsize));
				if (value <= 9)
					prefix += "\\tiny ";
				else if (value <= 11)
					prefix += "\\scriptsize ";
				else if (value <= 13)
					prefix += "\\footnotesize ";
				else if (value <= 15)
					prefix += "\\normalsize ";
				else if (value <= 17)
					prefix += "\\large ";
				else if (value <= 19)
					prefix += "\\Large ";
				else if (value <= 21)
					prefix += "\\LARGE ";
				else if (value <= 23)
					prefix += "\\huge ";
				else
					prefix += "\\Huge ";
			}
		}
	}
	
	if (textalign != null)
	{
		if ((textalign == "left") || (textalign == "start"))
			prefix += "\\RaggedRight "
		else if ((textalign == "right") || (textalign == "end"))
			prefix += "\\RaggedLeft "
		else if (textalign == "center")
			prefix += "\\Centering "
		else if (textalign == "justify")
			prefix += "\\justifying "
		// ignore all other options
	}
	
	return {prefix: prefix, postfix: postfix};
}



////////////////////////////////////////////////////////////////////////////////
// This function accepts a stream that may include form references, variable 
// references, calculation references, equations, etc.
////////////////////////////////////////////////////////////////////////////////
function serializeTableLaTeX(table, instancedata, stylesheet)
{
	let numcols = -1;
	let elemCaption = null;
	let out = "";
	let rules = ("rules" in table ? table.rules : null);
	
	// pre-process the list to determine number of columns. 
	// first just look for a colgroup - it will handle most of the effort
	table.forEach(function (element, index) {
		if ((element.nodeType == 'colgroup')
		{
			numcols = 0;
			element.inner.forEach(function (elementCol, indexCol) {
			if ((elementCol.nodeType == 'col')
			{
				if ("span" in elementCol)
				{
					const span = varToNumber(elementCol.span);
					if (span !== null)
						numcols += span;
					else
						numcols += 1;
				}
				else
					numcols++;
			}
		}
		else if ((element.nodeType == 'caption')
		{
			elemCaption = element;
		}
	}
	// if the colgroup wasn't found, parse the entire table and just make sure we have the right number of rows.
	if (numcols == -1)
	{
		table.forEach(function (element, index) {
			if ((element.nodeType == 'thead' || element.nodeType == 'tbody' || element.nodeType == 'tfoot')
			{
				element.forEach(function (elementSec, indexSec) {
					if ((elementSec.nodeType == 'tr')
					{
						let numcolsLcl = 0;
						elementSec.forEach(function (elementCol, index) {
							if ((elementCol.nodeType == 'td') || (elementCol.nodeType == 'th'))
							{
								if ("colspan" in elementCol)
								{
									const span = varToNumber(elementCol.colspan);
									if (span !== null)
										numcolsLcl += span;
									else
										numcolsLcl += 1;
								}
								else
									numcolsLcl++;
							}
						}
						if (numcols > 0 && numcolsLcl != numcols)
						{
							console.log("Warning: table " + table.id + "contains inconsistent numbers of columns.");
						}
						if (numcolsLcl > numcols)
							numcols = numcolsLcl;

					}
				}
			}
		}
	}
	// prep finished, generate the table header and table data
	if (numcols > 0)
	{
		// if there is a caption, but the table in the table environment
		if (elemCaption !== null)
		{
			out += "\\begin{table}\\caption{";
			const style = serializeStyleLatexPrefix(elemCaption,stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(elemCaption.inner,instancedata,stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		// center the table and let LaTeX know how many columns there are
		out += "\\begin{center}\\begin{tabular}{";
		for (let col = 0; col < numcols; col++)
		{ 
			if (rule !== null && ((rule == "cols") || (rule == "all")))
				out += "|";
			out += "c"; //@@TODO allow other alignments other than centered - need to interpret style information
		}
		if (rule !== null && ((rule == "cols") || (rule == "all")))
			out += "|";
		out += "}\n";
		table.forEach(function (element, index) {
			//@@TODO not currently supporting explicit thead or tfoot as any different than the rest of the table.
			if ((element.nodeType == 'thead' || element.nodeType == 'tbody' || element.nodeType == 'tfoot')
			{
				element.forEach(function (elementSec, indexSec) {
					if ((elementSec.nodeType == 'tr')
					{
						elementSec.forEach(function (elementCol, index) {
							if ((elementCol.nodeType == 'td') || (elementCol.nodeType == 'th'))
							{
								if (currcol > 0)
									out += "&"; // column separator
								let span = 1;
								if ("colspan" in elementCol)
								{
									const spanLcl = varToNumber(elementCol.colspan);
									if (spanLcl != null)
										span = spanLcl;
								}
								if (span > 1)
								{
									out += "\\multicolumn{" + span + "}{|c|}{";
									const style = serializeStyleLatexPrefix(elemCaption,stylesheet);
									out += style.prefix;
									out += serializeInnerLaTeX(elementCol.inner,instancedata,stylesheet);
									out += style.postfix;
									out += "}";
								}
								else
								{
									const style = serializeStyleLatexPrefix(elemCaption,stylesheet);
									out += style.prefix;
									out += serializeInnerLaTeX(elementCol.inner,instancedata,stylesheet);
									out += style.postfix;
								}
								currcol++;
							}
						}
						out += "\\\\\n" // end of row
						if (rule !== null && (rule == "rows" || rule == "all"))
							out += "\\hrule\n"
					}
				}
				if (rule !== null && (rule == "groups"))
					out += "\\hrule\n"
			}
		}
		out += "\\end{tabular}\\end{center}\n";
		if (elemCaption !== null)
			out += "\\end{table}\n";
	}
	return out;
}


//////////////////////////////////
// This function accepts a stream that may include form references, variable 
// references, calculation references, equations, etc.
//////////////////////////////////
function serializeInnerLaTeX(inner,instancedata, stylesheet)
{
	let out = new String();
	inner.forEach(function (element, index) {
		/// HTML tags
		if (element.nodeType == '#PCDATA')
		{
			out += element.value;
		}
		else if (element.nodeType == 'a')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += "\\href{\n"
			out += element.href;
			out += "}{"
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += "}\n"
			out += style.postfix;
		}
		else if (element.nodeType == 'abbr')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'acronym')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'address')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'area')
		{
			// no output
			// @@TODO could handle this in tikz
		}
		else if (element.nodeType == 'article')
		{
			// TODO maybe render this as a minipage?
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'aside')
		{
			// TODO maybe render this as a minipage or margin note?
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'audio')
		{
			// TODO maybe render this as a URL link?
		}
		else if (element.nodeType == 'b')
		{
			out += "\\textbf{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'base')
		{
			//TODO shouldn't be used, but maybe embed this info in the instancedata?
		}
		else if (element.nodeType == 'bdi')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'bdo')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'big')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += "{\\Large";
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += "}";
			out += style.postfix;
		}
		else if (element.nodeType == 'blockquote')
		{
			out += "\\begin{center}\\begin{minipage}{0.75\\textwidth}\n";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{minipage}\\end{center}";
		}
		else if (element.nodeType == 'body')
		{
			// this really shouldn't be here
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'br')
		{
			// this really shouldn't be here
			out += "\\newline\n"
		}
		else if (element.nodeType == 'button')
		{
			// no output
		}
		else if (element.nodeType == 'canvas')
		{
			// no output
		}
		else if ((element.nodeType == 'caption') || (element.nodeType == "figcaption"))
		{
			out += "\\caption{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'center')
		{
			out += "\\begin{center}"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{center}\n";
		}
		else if (element.nodeType == 'cite')
		{
			//@@TODO perhaps italics?
			out += "{\em";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'code')
		{
			out += "\\texttt{";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'col')
		{
			// no output
		}
		else if (element.nodeType == 'colgroup')
		{
			// no output
		}
		else if (element.nodeType == 'data')
		{
			// ignore, just renderr the inner
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'datalist')
		{
			// no output
		}
		else if (element.nodeType == 'dd')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if ((element.nodeType == 'del') || (element.nodeType == 's') || (element.nodeType == 'strike')) // strike technically depricated
		{
			out += "\\sout{";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'details')
		{
			// @@TODO ignore?
		}
		else if (element.nodeType == 'dfn')
		{
			// @TODO emph?
			out += "{\\em ";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'dialog')
		{
			// @TODO ignore? This is realy a form and input thing
		}
		else if (element.nodeType == 'dir')
		{
			// ignore
		}
		else if (element.nodeType == 'div')
		{
			// ignore? @@TODO maybe a minipage
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'dl')
		{
			out += "\\begin{description}\n"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{description}\n"
		}
		else if (element.nodeType == 'dt')
		{
			out += "\\item["
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "]"
		}
		else if (element.nodeType == 'em')
		{
			out += "{\\em";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'embed')
		{
			// ignore @@TODO perhaps fetch the embedded content?
		}
		else if (element.nodeType == 'fencedframe')
		{
			// ignore? @@TODO maybe a minipage
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'fieldset')
		{
			// ignore. input form data
		}
//		else if (element.nodeType == 'figcaption')
//		{
//			// handled with caption above
//		}
		else if (element.nodeType == 'fieldset')
		{
			// ignore. input form data
		}
		else if (element.nodeType == 'figure')
		{
			if (element.titled = "true")
				out += "\\begin{figure}[H]\n"
			out += "\\begin{center}\n"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{center}\n"
			if (element.titlted = "true")
				out += "\\end{figure}\n"
		}
		else if (element.nodeType == 'font')
		{
			// ignore; deprecated
		}
		else if (element.nodeType == 'font')
		{
			// ignore; deprecated
		}
		else if (element.nodeType == 'footer')
		{
			// ignore @@TODO could be useful, but I think it needs to be in the preamble for the doc
		}
		else if (element.nodeType == 'form')
		{
			// ignore
		}
		else if (element.nodeType == 'frame')
		{
			// ignore, @@TODO maybe a minipage
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'frameset')
		{
			// ignore, @@TODO maybe a minipage
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'h1')
		{
			out += "\\section*{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'h2')
		{
			out += "\\subsection*{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'h3')
		{
			out += "\\subsubsection*{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if ((element.nodeType == 'h4') || element.nodeType == 'h5') || element.nodeType == 'h6'))
		{
			out += "\\textbf{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}\n";
		}
		else if (element.nodeType == 'head')
		{
			// ignore
		}
		else if (element.nodeType == 'header')
		{
			// ignore @@TODO could be useful, but I think it needs to be in the preamble for the doc
		}
		else if (element.nodeType == 'hgroup')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'hr')
		{
			out += "\\hrule\n"
		}
		else if (element.nodeType == 'html')
		{
			// this really shouldn't be here, but just in case
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'i')
		{
			out += "{\\em "
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}"
		}
		else if (element.nodeType == 'iframe')
		{
			// ignore - @@TODO maybe a minipage for some circumstances?
		}
		else if (element.nodeType == 'iframe')
		{
			// ignore - @@TODO maybe a minipage for some circumstances?
		}
		else if (element.nodeType == 'img')
		{
			let numoptions = 0;
			let scale = null;
			let width = null;
			let length = null;
			let alt = null'
			
			out += '\\includegraphics';
			
			if ("scale" in element)
			{
				scale = varToNumber(element.scale);
			}
			if ("alt" in element)
			{
				alt = element.alt;
			}
			if ("width" in element)
			{
				width = varToNumber(element.width);
			}
			if ("length" in element)
			{
				length = varToNumber(element.length);
			}
			if (scale != null ||
				width != null ||
				length != null ||
				alt != null)
			{
				out += "[";
			}
			if (scale != null && scale != 1.0)
			{
				out += 'scale=' + scale;
				numoptions++;
			}
			if (width != null)
			{
				const widthcm = Math.round(width / 118.1,1);
				
				if (numoptions > 0)
					out += ","
				out += 'width=' + widthcm + "cm";
				numoptions++;
			}
			if (length != null)
			{
				const lengthcm = Math.round(length / 118.1,1);
				
				if (numoptions > 0)
					out += ","
				out += 'length=' + lengthcm + "cm";
				numoptions++;
			}
			if (alt != null)
			{
				if (numoptions > 0)
					out += ","
				out += "alt={" + alt + "}";
				numoptions++;
			}
			if (numoptions > 0)
				out += "]";
		
			out += '{' + element.src + '}\n';
		}
		else if (element.nodeType == 'input')
		{
			// ignore @@TODO maybe fillin to allow for name entry
		}
		else if (element.nodeType == 'ins')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'kbd')
		{
			out += "\\fbox{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'label')
		{
			// ignore - part of input/output
		}
		else if (element.nodeType == 'legend')
		{
			// ignore - part of fieldset
		}
		else if (element.nodeType == 'legend')
		{
			// ignore - part of fieldset
		}
		else if (element.nodeType == 'li')
		{
			out += "\\item "
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\n";
		}
		else if (element.nodeType == 'link')
		{
			// ignore
		}
		else if (element.nodeType == 'main')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'map')
		{
			// ignore
			// @@TODO could handle this in tikz
		}
		else if (element.nodeType == 'mark')
		{
			out += "\\hl{";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'marquee')
		{
			// ignore
		}
//		else if (element.nodeType == 'menu')
//		{
//			// handled as ul
//		}
		else if (element.nodeType == 'meta')
		{
			// ignore
		}
		else if (element.nodeType == 'meter')
		{
			// ignore
		}
		else if (element.nodeType == 'nav')
		{
			// ignore
		}
		else if (element.nodeType == 'nobr')
		{
			// ignore
		}
		else if (element.nodeType == 'noembed')
		{
			// ignore
		}
		else if (element.nodeType == 'noframess')
		{
			// ignore
		}
		else if (element.nodeType == 'noscript')
		{
			// ignore
		}
		else if (element.nodeType == 'object')
		{
			// ignore
		}
		else if (element.nodeType == 'ol')
		{
			if (element.listtype == "i")
				out += "\\begin{enumerate}[label=(\roman*)]\n"
			if (element.listtype == "I")
				out += "\\begin{enumerate}[label=(\Roman*)]\n"
			else if (element.listtype == "1")
				out += "\\begin{enumerate}\n"
			else if (element.listtype == "a")
				out += "\\begin{enumerate}[label={\alph*}]\n"
			else if (element.listtype == "A")
				out += "\\begin{enumerate}[label={\Alph*}]\n"
			else
				out += "\\begin{enumerate}\n"

			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{enumerate}\n"
		}
		else if (element.nodeType == 'optgroup')
		{
			// ignore
		}
		else if (element.nodeType == 'option')
		{
			// ignore
		}
		else if (element.nodeType == 'output')
		{
			// ignore
		}
		else if (element.nodeType == 'p')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\n\n";
		}
		else if (element.nodeType == 'param')
		{
			// ignore
		}
		else if (element.nodeType == 'picture')
		{
			// ignore, but process inner to get the img
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'plaintext')
		{
			// ignore
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'pre')
		{
			out += "\\begin{verbatim}"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{verbatim}"
		}
		else if (element.nodeType == 'progress')
		{
			// ignore
		}
		else if (element.nodeType == 'q')
		{
			out += "``"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "''"
		}
		else if ((element.nodeType == 'rb') || (element.nodeType == 'rp') || (element.nodeType == 'rb') || (element.nodeType == 'rtc') || (element.nodeType == 'ruby'))
		{
			// ignore
		}
//		else if (element.nodeType == 's')
//		{
//			// handled with del
//		}
		else if (element.nodeType == 'samp')
		{
			out += "\\texttt"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}"
		}
		else if (element.nodeType == 'script')
		{
			// ignore
		}
		else if (element.nodeType == 'search')
		{
			// ignore
		}
		else if (element.nodeType == 'section')
		{
			// ignore but process inner
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'select')
		{
			// ignore
		}
		else if (element.nodeType == 'selectedcontent')
		{
			// ignore
		}
		else if (element.nodeType == 'slot')
		{
			// ignore? @@TODO but process inner
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'small')
		{
			// ignore? @@TODO but process inner
			out += "{\\small"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}"
		}
		else if (element.nodeType == 'source')
		{
			// ignore
		}
		else if (element.nodeType == 'span')
		{
			// ignore
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
//		else if (element.nodeType == 'strike')
//		{
//			// strike handled with del and s
//		}
		else if (element.nodeType == 'strong')
		{
			out += "\\textbf{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'style')
		{
			// ignore
		}
		else if (element.nodeType == 'sub')
		{
			out += "\\textsubscript{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'summary')
		{
			// @@TODO ignore?
		}
		else if (element.nodeType == 'sup')
		{
			out += "\\textsuperscript{"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'summary')
		{
			// @@TODO ignore?
		}
		else if (element.nodeType == 'table')
		{
			// table requires extra work - use a special function
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeTableLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if ((element.nodeType == 'tbody') || (element.nodeType == 'td') || (element.nodeType == 'tfoot') || (element.nodeType == 'th') || (element.nodeType == 'thead') || (element.nodeType == 'tr'))
		{
			// ignore - these shouldn't occur outside of a table anyway
		}
		else if (element.nodeType == 'template')
		{
			// ignore - this is a table template for javascript
		}
		else if (element.nodeType == 'textarea')
		{
			// ignore - input element
		}
		else if (element.nodeType == 'time')
		{
			// ignore the timestamp, just fill in the inner text
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'time')
		{
			// ignore the timestamp, just fill in the inner text
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'title')
		{
			// ignore - this sets the document title
		}
		else if (element.nodeType == 'track')
		{
			// ignore - used for audio or video
		}
		else if (element.nodeType == 'tt')
		{
			out += "\\texttt{";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if (element.nodeType == 'u')
		{
			out += "\\underline{";
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "}";
		}
		else if ((element.nodeType == 'ul') || (element.nodeType == 'menu'))
		{
			out += "\\begin{itemize}\n"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "\\end{itemize}\n"
		}
		else if (element.nodeType == 'var')
		{
			out += "$"
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
			out += "$"
		}
		else if (element.nodeType == 'video')
		{
			// ignore
		}
		else if (element.nodeType == 'wbr')
		{
			out += "\\allowbreak"
		}
		else if (element.nodeType == 'xmp')
		{
			// ignore
		}
/////////////////////////////////////////////////////////////
//
// xquiz specific tags
//
/////////////////////////////////////////////////////////////
		
		else if (element.nodeType == 'equation')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += serializeInnerLaTeX(element.inner,instancedata, stylesheet);
			out += style.postfix;
		}
		else if (element.nodeType == 'latex')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += element.inner;
			out += style.postfix;
		}
		else if (element.nodeType == 'ref')
		{
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += "\\ref{" + element.idref + "}"
			out += style.postfix;
		}
		else if (element.nodeType == 'numref')
		{
			let variable = instance.data[element.idref];
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += variable.serializeLatex();
			out += style.postfix;
		}
		else if (element.nodeType == 'varref')
		{
			let variable = instance.data[element.idref];
			const style = serializeStyleLatexPrefix(element, stylesheet);
			out += style.prefix;
			out += variable.serializeLatex();
			out += style.postfix;
		}
		else if (element.nodeType == 'vspace')
		{
			out += '\\vspace{' + element.size + '}\n';
		}
		else if (element.nodeType == 'hspace')
		{
			out += '\\hspace{' + element.size + '}\n';
		}
		
	});
	return out;
}
