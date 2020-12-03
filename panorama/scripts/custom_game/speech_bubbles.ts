
var lastBubble: Panel | null;
var curLoc: Vector;
var xOffset: number;
var yOffset: number;
var maxDuration: number;
var timeDelta: number;

function ShowBubble(location: Vector, text: string, duration: number) {
	let firstChar = text.substr(0, 1);
	if (firstChar == "#") {
		let newText = $.Localize(text);
		if (newText.length == 0) {
			$.Msg("localize not working! :/")
		} else {
			text = newText;
		}
	}

	maxDuration = duration;

	curLoc = location;
	MeasureText(text, ShowBubbleFinish);
}

function ShowBubbleFinish(text:string, height:number, width:number) {
	if (lastBubble) {
		lastBubble.DeleteAsync(0);
	}

	xOffset = width + 30;
	yOffset = height + 30 + 20;

	let newPanel = $.CreatePanel("Panel", $.GetContextPanel(), "speech_bubble");
	newPanel.BLoadLayoutSnippet("SpeechBubble");
	newPanel.AddClass("BubblesMainActive");
	newPanel.style.width = xOffset + "px";
	newPanel.style.height = yOffset + "px";
	let label = newPanel.FindChildTraverse("BubblesText") as LabelPanel;
	let body = newPanel.FindChildrenWithClassTraverse("BubblesBody")[0];
	body.style.height = (yOffset - 20) + "px";

	label.html = true;
	label.text = text;

	var screenCoord = GameUI.WorldToScreenXYClamped(curLoc);
	newPanel.style.position = (toAbs(screenCoord[0], false) - xOffset) + "px " + (toAbs(screenCoord[1], true) - yOffset) + "px 0px";

	lastBubble = newPanel;

	timeDelta = 0;
	$.Schedule(Game.GetGameFrameTime(), KeepPosition);
}

function KeepPosition() {
	timeDelta += Game.GetGameFrameTime();
	if (timeDelta >= maxDuration) {
		if (lastBubble) {
			lastBubble!.RemoveClass("BubblesMainActive");
			lastBubble!.DeleteAsync(0.2);
			lastBubble = null;
		}
		return;
	}
	var screenCoord = GameUI.WorldToScreenXYClamped(curLoc);
	lastBubble!.style.position = (toAbs(screenCoord[0], false) - xOffset) + "px " + (toAbs(screenCoord[1], true) - yOffset) + "px 0px";
	$.Schedule(Game.GetGameFrameTime(), KeepPosition);
}

function MeasureText(text: string, callback: (text:string, height:number, width:number) => void) {
	let testPanel = $.CreatePanel("Label", $.GetContextPanel(), "TestPanel") as LabelPanel;
	testPanel.style.fontFamily = "Radiance Black";
	testPanel.style.color = "rgba(0,0,0,0)";
	testPanel.html = true;
	testPanel.text = text;
	$.Schedule(1/20, () => {
		let height = testPanel.contentheight;
		let width = testPanel.actuallayoutwidth;
		testPanel.DeleteAsync(0);
		callback(text, height, width);
	});
}

interface CustomGameEventDeclarations 
{
	show_speech_bubble: {locX: number, locY: number, locZ: number, text: string, duration: number};
}

GameEvents.Subscribe("show_speech_bubble", event => {
	ShowBubble([event.locX, event.locY, event.locZ], event.text, event.duration);
});

function toAbs(percent: number, height: boolean): number {
	if (height) {
		return Game.GetScreenHeight() * percent;
	}
	return Game.GetScreenWidth() * percent;
}

type Vector = [number, number, number];