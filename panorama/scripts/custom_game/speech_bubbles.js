"use strict";
var lastBubble;
var curLoc;
var xOffset;
var yOffset;
var maxDuration;
var timeDelta;
function ShowBubble(location, text, duration) {
    let firstChar = text.substr(0, 1);
    if (firstChar == "#") {
        let newText = $.Localize(text);
        if (newText.length == 0) {
            $.Msg("localize not working! :/");
        }
        else {
            text = newText;
        }
    }
    maxDuration = duration;
    curLoc = location;
    MeasureText(text, ShowBubbleFinish);
}
function ShowBubbleFinish(text, height, width) {
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
    let label = newPanel.FindChildTraverse("BubblesText");
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
            lastBubble.RemoveClass("BubblesMainActive");
            lastBubble.DeleteAsync(0.2);
            lastBubble = null;
        }
        return;
    }
    var screenCoord = GameUI.WorldToScreenXYClamped(curLoc);
    lastBubble.style.position = (toAbs(screenCoord[0], false) - xOffset) + "px " + (toAbs(screenCoord[1], true) - yOffset) + "px 0px";
    $.Schedule(Game.GetGameFrameTime(), KeepPosition);
}
function MeasureText(text, callback) {
    let testPanel = $.CreatePanel("Label", $.GetContextPanel(), "TestPanel");
    testPanel.style.fontFamily = "Radiance Black";
    testPanel.style.color = "rgba(0,0,0,0)";
    testPanel.html = true;
    testPanel.text = text;
    $.Schedule(1 / 20, () => {
        let height = testPanel.contentheight;
        let width = testPanel.actuallayoutwidth;
        testPanel.DeleteAsync(0);
        callback(text, height, width);
    });
}
GameEvents.Subscribe("show_speech_bubble", event => {
    ShowBubble([event.locX, event.locY, event.locZ], event.text, event.duration);
});
function toAbs(percent, height) {
    if (height) {
        return Game.GetScreenHeight() * percent;
    }
    return Game.GetScreenWidth() * percent;
}
