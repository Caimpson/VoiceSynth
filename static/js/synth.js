/*********************** Web Audio API setup ***********************/
let AudioContext = null;
let ctx = null;
const semitoneRatio = 1.059463; // ratio of tone:(tone + semitone) = 1:1.059463

activeVoices = []; // Array of voices (oscillators)

function setup(){
	AudioContext = window.AudioContext || window.webkitAudioContext;
	ctx = new AudioContext(); // Creating audio context

	// Looping through each oscillator and setting default values
	for (let i = 0; i <4; i++) {
		disableOscControls(i);
		document.getElementById("waveSelect"+i).value = "sine";
		document.getElementById("filterTypeSelect" + i).value = "lowpass";
		document.getElementById("filterGainSlider" + i).disabled = true;
	}
}

/*********************** Class for oscillator voice ***********************/

class Voice {
	 constructor(){
		this.osc = ctx.createOscillator();
		this.gainNode = ctx.createGain();
		this.filter = ctx.createBiquadFilter();
		this.level = 0.3;
		this.active = false;
		this.filterType = "lowpass";
		this.filterFreq = 20000;
		this.filterQ = 0;
		this.filterGain = 0;
		this.pitch = 0;
		this.semitoneMod = 0;
	}


	start(pitch) {
		// Oscillator
		let pitchMod = 1;

		if(this.semitoneMod !== 0) { // if base pitch has been increased or decreased by some amount of semitones...
			pitchMod = Math.pow(semitoneRatio, this.semitoneMod); // pitch modifier = 1.059463^however many semitones
		}
		this.pitch = pitch * pitchMod;
		this.osc.frequency.value = this.pitch;

		// Gain
		this.gainNode.gain.exponentialRampToValueAtTime(this.level, ctx.currentTime + 0.05);

		if (!this.active) {
			// connect the graph if not already playing
			this.osc.connect(this.filter);
			this.filter.connect(this.gainNode);
			this.gainNode.connect(ctx.destination);


			this.osc.start(ctx.currentTime);
			this.active = true;
		}

	}

	stop() {
		this.osc.stop(ctx.currentTime);
		this.active = false;
	}


	changeLevel(val){
		this.level = val;
		this.gainNode.gain.exponentialRampToValueAtTime(this.level, ctx.currentTime + 0.05);
	}

	mute(){
		this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, ctx.currentTime);
		this.gainNode.gain.exponentialRampToValueAtTime(0.000001, ctx.currentTime + 0.05);
	}

	changeWaveform(val){
		this.osc.type = val;
	}

	changeFreq(val){
		if(val === "+"){ // Want higher note
			this.semitoneMod++;
			this.pitch *= semitoneRatio; // This is roughly plus 1 semitone
			this.osc.frequency.value = this.pitch;
		}
		if(val === "-"){
			this.semitoneMod--;
			this.pitch *= 1/semitoneRatio; // This is roughly minus 1 semitone
			this.osc.frequency.value = this.pitch;
		}
	}

	/////// Filter Methods ///////

	activateFilter(){ // Sets filter parameters to default settings
		this.filter.type = this.filterType;
		this.filter.frequency.value = this.filterFreq;
		this.filter.Q.value = this.filterQ;
		this.filter.gain.value = this.filterGain;
	}

	deactivateFilter(){
		this.filter.type = "lowpass";
		this.filter.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + 0.05);
		this.filter.Q.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
	}

	changeFilterFreq(val){
		this.filter.frequency.exponentialRampToValueAtTime(val, ctx.currentTime + 0.05);
		this.filterFreq = val;
	}

	changeFilterGain(val){
		this.filter.gain.setValueAtTime(val, ctx.currentTime + 0.05);
		this.filterGain = val;
	}

	changeFilterQ(val){
		this.filter.Q.setValueAtTime(val, ctx.currentTime + 0.05);
		this.filterQ = val;
	}

	changeFilterType(val){
		this.filter.type = val;
		this.filterType = val;
	}
}

/*********************** Oscillator Control Functions ***********************/

// Function to create or unmute oscillators
function createVoice(index, buttonID){
	if(document.getElementById(buttonID).innerHTML === "On"){
		document.getElementById(buttonID).innerHTML = "Off";
		if(activeVoices[index] == null){

			activeVoices[index] = new Voice();
			document.getElementById(buttonID).innerHTML = "Off";
			enableOscControls(index);
		}
		activeVoices[index].changeLevel(0.1);
		enableOscControls(index);
	}

	else{
		document.getElementById(buttonID).innerHTML = "On";
		disableOscControls(index);
		reset(index);
	}	
}

function reset(index){
	activeVoices[index].changeLevel(0.0000001);
	activeVoices[index].stop();
	delete activeVoices[index];
	disableOscControls(index);
	document.getElementById("waveSelect"+index).value = "sine";
	document.getElementById("startOsc"+index).innerHTML = "On";
}

function resetAll(){
	for(let i = 0; i < activeVoices.length; i++){
		reset(i);
	}
}

function startAll(pitch){

	activeVoices.forEach(function continueVoices(voice, index){
		voice.start(pitch);
		enableOscControls(index);
		document.getElementById("startOsc"+index).innerHTML = "Off";
	});
}

function stopAll(){
	activeVoices.forEach(function pauseVoices(voice){
		voice.mute();	
	});
}

function disableOscControls(index){
	let divID = ("controlsContainer"+index);
	let elements = document.getElementById(divID).getElementsByTagName('*');

	for(let i=0; i<elements.length;i++) {
        	elements[i].disabled = true;
    	}

    disableFilterControls(index);
}


function enableOscControls(index){
	let divID = ("controlsContainer"+index);
	let elements = document.getElementById(divID).getElementsByTagName('*');

	for(let i = 0; i < elements.length; i++) {
        	elements[i].disabled = false;
    	}
}


function changeLevel(index, id, val){
	document.getElementById(id).innerHTML = parseFloat(val).toFixed(2);
	try {
		activeVoices[index].changeLevel(val);
	}catch(err){}
	
}

function changeWaveform(index, val){
	try {
		activeVoices[index].changeWaveform(val);
		const sliderLevel = document.getElementById("osc"+index+"SliderLevel");
		if(val === "square" || val === "sawtooth"){
			sliderLevel.max = 0.11;
			activeVoices[index].changeLevel(0.04);
		}else{
			sliderLevel.max = 1.01;
		}
	}catch(err){}
}

function changeFreq(index, id, val){
	try {
		activeVoices[index].changeFreq(val);
		document.getElementById("semitoneMod"+index).innerHTML = "Semitone Modifier: " + activeVoices[index].semitoneMod;
	}catch(err){console.log(err.message)}
}

/*********************** Filter Control Functions ***********************/

function toggleFilter(index, buttonID){
	if(document.getElementById(buttonID).innerHTML === "On"){
		document.getElementById(buttonID).innerHTML = "Off";
		enableFilterControls(index);
		activeVoices[index].activateFilter();
	}else{
		document.getElementById(buttonID).innerHTML = "On";
		disableFilterControls(index);
		activeVoices[index].deactivateFilter();
	}
}

function disableFilterControls(index){
	let divID = ("filterContainer"+index);
	let elements = document.getElementById(divID).getElementsByTagName('*');

	for(let i = 0; i < elements.length; i++) {
        	elements[i].disabled = true;
    	}
}

function enableFilterControls(index){
	let divID = ("filterContainer"+index);
	let elements = document.getElementById(divID).getElementsByTagName('*');

	for(let i = 0; i < elements.length; i++) {
        	elements[i].disabled = false;
    	}
}

function changeFilterFreq(index, id, val){
	document.getElementById(id).innerHTML = val;
	activeVoices[index].changeFilterFreq(val);
}

function changeFilterQ(index, id, val){
	document.getElementById(id).innerHTML = val;
	activeVoices[index].changeFilterQ(val);
}

function changeFilterGain(index, id, val){
	document.getElementById(id).innerHTML = val;
	activeVoices[index].changeFilterGain(val);
}

function changeFilterType(index, val){
	activeVoices[index].changeFilterType(val);
	document.getElementById("filterGainSlider" + index)
		.disabled = val === "lowpass" || val === "highpass" || val === "bandpass" || val === "notch" || val === "allpass";

	document.getElementById("filterQSlider" + index).disabled = val === "lowshelf" || val === "highshelf";
}

/*********************** Qwerty Hancock Keyboard ***********************/

const keyboard = new QwertyHancock({
	id: 'keyboard',
	width: 800,
	height: 150,
	octaves: 2,
});

/* this 'keysPressed' mechanic is to keep track of how many keys have been pressed so that
 * when a single key is released it doesnt stop all sound if there are still other keys pressed */
let keysPressed = 0;

// Herby-Hancock Function for when key is pressed
keyboard.keyDown = function (note, frequency) {

    let offCounter = 0;

    keysPressed++;

    for (let i = 0; i <4; i++) {
    	if (activeVoices[i] == null)
    		offCounter++;
	}

    if (offCounter === 4){
    	alert("No oscillators are on!");
	}

    else{
    	startAll(frequency);
	}
};

// Herby-Hancock Function for when key is released
keyboard.keyUp = function (note, frequency) {
	keysPressed--;
	if(keysPressed === 0)
    	stopAll();
};

/*********************** Instructions for synth ***********************/

function showInstructions() {
	alert("Welcome to VoiceSynth, the voice controlled synthesizer!\n\n" +
		"This synthesizer can be used with either the graphical controls or by using vocal commands.\n\n" +
		"To start making sounds turn on one of the oscillators and interact with the onscreen keyboard, either by clicking keys or by pressing keys on your computer keyboard.\n\n" +
		"To turn on an oscillator either click the 'on' button at the top of the oscillator or click the mic input button and say a command like 'Turn on oscillator 1.', for example.\n\n" +
		"All settings of the oscillators can be changed by vocal commands. Just state which oscillator you want to control and what you want to change (For example: 'turn Oscillator one's volume up').\n\n" +
		"Changing the settings on a filter works the same way. To do this give a command with a filter name and an instruction, for example: 'filter 2 on'\n\n" +
		"To stop all active oscillators give a command using the word 'all', such as 'reset all', or 'all off'.")
}