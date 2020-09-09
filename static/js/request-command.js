$(document).ready(function () {
	$("#speechInputButton").click(function () {
		$.ajax({
			url : "http://127.0.0.1:5000/control",
			success : function (response) {

				let command = response.command; // Server responds with command

				console.log("Response:" + command);

				$("#speechOutputAsText").html(command); // Command is shown in textArea

				if(command.includes("oscillator")) { // If command pertains to an oscillator
					// Which oscillator?
					let oscIndex = getIndex(command, "oscillator");
					let oscLabel = "osc" + oscIndex; 

					// If the user mentions "level" or related terms
					if (command.includes("level") || command.includes("volume")) {

						let control = (oscLabel + "SliderLevel");
						let currentLevel = $("#"+control).val();

						if (command.includes("up") || command.includes("increase") 
							|| command.includes("app")
							&& currentLevel < parseFloat($('#'+control).attr("max"))) {

							currentLevel = parseFloat(currentLevel) + 0.03;

						} else if (command.includes("down")
							|| command.includes("decrease")
							|| command.includes("lower")
							&& currentLevel > parseFloat($('#'+control).attr("min"))) {

							currentLevel = parseFloat(currentLevel) - 0.03;
						}

						$('#'+control).val(currentLevel);
						changeLevel(oscIndex, (oscLabel+"Level"), currentLevel);
					}

					// If the user mentions "pitch" or related terms
					if (command.includes("pitch") || command.includes("frequency")
						|| command.includes("semitone") || command.includes("note")
						&& !command.includes("filter")) {

						let control = (oscLabel + "FreqButton");

						if (command.includes("increase") || command.includes("up")
							|| command.includes("app") || command.includes("higher") 
							|| command.includes("raise")) {

							changeFreq(oscIndex, control, "+");
						}
						if (command.includes("decrease") || command.includes("down")
							|| command.includes("lower")) {

							changeFreq(oscIndex, control, "-");
						}
					}

					// If the user mentions "waveform" or related terms
					if (command.includes("waveform") || command.includes("way form")
						|| command.includes("way from")) {

						let control = ("waveSelect" + oscIndex);
						console.log('#'+control);

						if (command.includes("sine") || command.includes("sign")) {
							$('#'+control).val('sine');
							changeWaveform(oscIndex, "sine");
						}
						if (command.includes("square") || command.includes("Square")) {
							$('#'+control).val('square');
							changeWaveform(oscIndex, "square");
						}
						if (command.includes("sawtooth") || command.includes("saw tooth")
							|| command.includes("sorted")) {
							$('#'+control).val('sawtooth');
							changeWaveform(oscIndex, "sawtooth");
						}
						if (command.includes("triangle") || command.includes("try angle")) {
							$('#'+control).val('triangle');
							changeWaveform(oscIndex, "triangle");
						}
					}

					// If the user mentions "on", "off", or related terms, and doesnt mention the filter
					if (command.includes("on") || command.includes("off")
						|| command.includes("-off") || command.includes("of")
						|| command.includes("start") || command.includes("stop")
						|| command.includes("-stop") && command.includes("filter") == false) {

						$( "#startOsc"+oscIndex ).trigger( "click" );
					}
				}

				// if the command pertains to a filter
				else if(command.includes("filter") && command.includes("oscillator") == false) {
					// Which filter?
					let filterIndex = getIndex(command, "filter");

					// Filter gain voice control
					if (command.includes("gain") || command.includes("game")) {

						let control = ("filterGainSlider" + filterIndex);
						console.log(control + " Level control selected");
						let currentGain = $("#" + control).val();
						console.log(currentGain + " current Gain");

						if (command.includes("up") || command.includes("increase")
							|| command.includes("app") 
							&& currentGain < parseFloat($('#'+control).attr("max"))) {

							currentGain = parseFloat(currentGain) + 5;

						} else if (command.includes("down")
							|| command.includes("decrease")
							|| command.includes("lower")
							&& currentGain > parseFloat($('#'+control).attr("min"))) {

							currentGain = parseFloat(currentGain) - parseFloat($('#'+control).attr("step"));
						}

					$('#'+control).val(currentGain);
					changeFilterGain(filterIndex, ("filterGain"+filterIndex), currentGain);
					}

					// Filter frequency voice control
					if (command.includes("frequency")) {

						let control = ("filterFreqSlider" + filterIndex);
						console.log(control + " Freq control selected");
						let currentFreq = $("#"+control).val();
						console.log(currentFreq + " current Freq");

						if (command.includes("up") || command.includes("increase")
							|| command.includes("app")
							&& currentFreq < parseFloat($('#'+control).attr("max"))) {

							currentFreq = parseFloat(currentFreq) + 50;

						} else if (command.includes("down")
							|| command.includes("decrease")
							|| command.includes("lower")
							&& currentFreq > parseFloat($('#'+control).attr("min"))) {

							currentFreq = parseFloat(currentFreq) - parseFloat($('#'+control).attr("step"));
						}

						$('#'+control).val(currentFreq);
						changeFilterFreq(filterIndex, ("filterFreq"+filterIndex), currentFreq);
					}

					// Filter Q voice control
					if (command.includes("queue") || command.includes("que")
						|| command.includes("q") || command.includes("Q")) {

						let control = ("filterQSlider" + filterIndex);
						console.log(control + " Q control selected");
						let currentQ = $("#"+control).val();
						console.log(currentQ + " current Freq");

						if (command.includes("up") || command.includes("increase")
							|| command.includes("app")
							&& currentQ < parseFloat($('#'+control).attr("max"))) {

							currentQ = parseFloat(currentQ) + 50;

						} else if (command.includes("down")
							|| command.includes("decrease")
							|| command.includes("lower")
							&& currentQ > parseFloat($('#'+control).attr("min"))) {

							currentQ = parseFloat(currentQ) - parseFloat($('#'+control).attr("step"));
						}

						$('#'+control).val(currentQ);
						changeFilterQ(filterIndex, ("filterQ"+filterIndex), currentQ);
					}

					// Filter type voice control
					if (command.includes("type")) {

						let control = ("filterTypeSelect" + filterIndex);

						if (command.includes("low pass") || command.includes("low-pass")) {
							$('#'+control).val('lowpass');
							changeWaveform(filterIndex, "lowpass");
						}
						if (command.includes("high pass") || command.includes("high-pass")) {
							$('#'+control).val('highpass');
							changeWaveform(filterIndex, "highpass");
						}
						if (command.includes("bandpass")) {
							$('#'+control).val('bandpass');
							changeWaveform(filterIndex, "bandpass");
						}
						if (command.includes("low shelf")) {
							$('#'+control).val('lowshelf');
							changeWaveform(filterIndex, "lowshelf");
						}
						if (command.includes("high shelf")) {
							$('#'+control).val('highshelf');
							changeWaveform(filterIndex, "highshelf");
						}
						if (command.includes("peaking") || command.includes("Peking")) {
							$('#'+control).val('peaking');
							changeWaveform(filterIndex, "peaking");
						}
						if (command.includes("notch")) {
							$('#'+control).val('notch');
							changeWaveform(filterIndex, "notch");
						}
						if (command.includes("all pass")) {
							$('#'+control).val('allpass');
							changeWaveform(filterIndex, "allpass");
						}
					}

					// If the user mentions "on", "off", or related terms in relation to the filter
					if (command.includes("on") || command.includes("off")
						|| command.includes("-off") || command.includes("of")
						|| command.includes("start") || command.includes("stop")
						|| command.includes("-stop")) {

						$("#startFilter"+filterIndex).trigger( "click" );
					}
				}

				// If master controls are invoked with "all"
				else if(command.includes("all")) {
					// If the user mentions "off" or "reset" or related terms
					if (command.includes("off") || command.includes("-off")
						|| command.includes("of") || command.includes("stop")
						|| command.includes("-stop") || command.includes("reset")) {

						resetAll();
					}
				}
			}
		});
	});
});

function getIndex(command, keyword){

	let index = 0;

	// Search surrounding words to find out
	let words = command.split(" ");
	let nextWord = words[$.inArray(keyword, words)+1];
	let prevWord = words[$.inArray(keyword, words)-1];

	// Parse input to find index
	if (nextWord === "1" || nextWord === "won" || prevWord === "first") {
		
		index = 0;
	}
	if (nextWord === "2" || nextWord === "two" || nextWord === "to" || nextWord === "too"
		|| prevWord === "second") {

		index = 1;
	}
	if (nextWord === "3" || nextWord === "three" || prevWord === "third") {

		index = 2;
	}
	if (nextWord === "4" || nextWord === "four" || nextWord === "for" || nextWord === "fore"
		|| prevWord === "fourth" || nextWord === "forth"){

		index = 3;
	}

	return index;
}