var playerClass = {
	emojiBox(inputField) {
		var trigger = event.target;
		// trigger.style.display = "none";
		var emoji = "😃😜😋😂🤣😥😅😆😉😊😎😍😘🤗🤩🤔😴😭😱😵🕥🖐👍👎🙏🌈🧡❤💖";

		inputField = document.getElementById(inputField);
		var emoDiv = document.createElement("DIV");
		var open = false;
		emoDiv.style = "overflow: auto;font-size: 34px;position: absolute;width: 100%;height: 100%;max-height: 450px;background: rgba(255, 255, 255, 0.75);border: 1px solid lightgray;border-radius: 4px;padding: 10px;bottom: 70px;display: flex;flex-flow: wrap;";
		[...emoji].forEach((el) => {
			var emo = document.createElement("SPAN");
			emo.style = "cursor: pointer;margin: 7px;";
			emo.innerHTML = el;
			emo.onclick = (evt) => {
				var start = inputField.selectionStart,
					inputValue = inputField.value;
				inputField.value = inputValue.slice(0, start) + el + inputValue.slice(start, inputValue.length);
				inputField.selectionEnd = start + 2;
			};
			emoDiv.appendChild(emo);
		});
		inputField.parentElement.appendChild(emoDiv);
		document.body.onclick = function a(evt) {
			if (open && !emoDiv.contains(evt.target)) {
				// inputField.dispatchEvent(new KeyboardEvent('keydown', { 'key': '32' }), console.log("sssss"));
				// trigger.style.display = "block";
				emoDiv.remove();
				this.removeEventListener("click", a); /** remove eventlistener */
			}
			open = true;
		};
	},
	async copyToClipboard(text) {
		var el = document.createElement("textarea");
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);
		return text;
	},
};
