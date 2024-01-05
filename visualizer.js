let masterDeviceSelect;
let redDeviceSelect;
let greenDeviceSelect;
let blueDeviceSelect;
let masterDevice;
let redDevice;
let blueDevice;
let greenDevice;

let lights;

document.addEventListener("DOMContentLoaded",initialize);


function initialize()
{
    masterDeviceSelect = document.querySelector("#masterChannel");
    masterDeviceSelect.addEventListener('change', () => {masterDevice = masterDeviceSelect.value});

    redDeviceSelect = document.querySelector("#redChannel");
    redDeviceSelect.addEventListener('change', () => {redDevice = redDeviceSelect.value});

    greenDeviceSelect = document.querySelector("#greenChannel");
    greenDeviceSelect.addEventListener('change', () => {greenDevice = greenDeviceSelect.value});

    blueDeviceSelect = document.querySelector("#blueChannel");
    blueDeviceSelect.addEventListener('change', () => {blueDevice = blueDeviceSelect.value});

    navigator.requestMIDIAccess().then(success,failure);

    lights =
    [
        new Light("drumLeft", 68, 69, 70),
        new Light("drumRight", 53, 54, 55),
        new Light("sideLeft", 63, 64, 65),
        new Light("sideRight", 58, 59, 60),
        new Light("cabLeftOut", 48,49,50),
        new Light("cabLeftIn", 45,46,47),
        new Light("cabRightIn", 42,43,44),
        new Light("cabRightOut", 39,40,41),
        new Light("frontLeft", 36,37,38),
        new Light("frontRight", 33,34,35)
    ];
}


function success(midiAccess)
{
    midiAccess.addEventListener('statechange',updateLists);
    let inputs = midiAccess.inputs;

    inputs.forEach(input => {
        input.addEventListener('midimessage', midiInput);
    })
}

function failure()
{
    console.log("Could not connect MIDI");
}

function updateLists(event)
{
    if (event.port.type === 'input')
    {
        if(event.port.state === 'connected')
        {
            let listItem = document.createElement('option');
            listItem.value = `${event.port.manufacturer} ${event.port.name}`;
            listItem.innerHTML = `${event.port.manufacturer} ${event.port.name}`;
            listItem.id = `${event.port.manufacturer} ${event.port.name}`;
            masterDeviceSelect.add(listItem.cloneNode(true));
            redDeviceSelect.add(listItem.cloneNode(true));
            greenDeviceSelect.add(listItem.cloneNode(true));
            blueDeviceSelect.add(listItem.cloneNode(true));
        }
        else if(event.port.state === 'disconnected')
        {
            let index;
            for (index = 0; index < masterDeviceSelect.length; index++)
            {
                if (masterDeviceSelect.options[index].id === `${event.port.manufacturer} ${event.port.name}`)
                    break;
            }

            console.log(index);
            masterDeviceSelect.remove(index);
            redDeviceSelect.remove(index);
            greenDeviceSelect.remove(index);
            blueDeviceSelect.remove(index);

        }
    }

    masterDevice = masterDeviceSelect.value;
    redDevice = redDeviceSelect.value;
    blueDevice = blueDeviceSelect.value;
    greenDevice = greenDeviceSelect.value;

}


function midiInput(event)
{
    let messageName = `${event.currentTarget.manufacturer} ${event.currentTarget.name}`

    if (messageName === masterDevice)
    {
        if (event.data[0] == 144 || event.data[0] == 128)
        {
            for (let i = 0; i < lights.length; i++)
            {
                if (event.data[1] === lights[i].rNote)
                {
                    lights[i].r = event.data[2] * 2;
                    lights[i].displayColor();
                }

                if (event.data[1] === lights[i].gNote)
                {
                   lights[i].g = event.data[2] * 2;
                   lights[i].displayColor();
                }

                if (event.data[1] === lights[i].bNote)
                {
                    lights[i].b = event.data[2] * 2;
                    lights[i].displayColor();
                }
            }
        }
    }
    else if (messageName === redDevice)
    {

    }
    else if (messageName === greenDevice)
    {

    }
    else if (messageName === blueDevice)
    {

    }


    if(redDevice === messageName)
    {
        console.log(`Red device: ${event.data[0]} ${event.data[1]} ${event.data[2]}`);
    }

    if(greenDevice === messageName)
    {
        console.log(`Green device: ${event.data[0]} ${event.data[1]} ${event.data[2]}`);
    }

    if(blueDevice === messageName)
    {
        console.log(`Blue device: ${event.data[0]} ${event.data[1]} ${event.data[2]}`);
    }
}


function parseColor(colorString)
{
    let color = '';
    let colorArray;

    if (!colorString)
        return [0,0,0];

    color = colorString.substring(4,colorString.length-1);
    colorArray = color.split(', ');
    return colorArray;
}


class Light
{
    name;
    element;
    r;
    g;
    b;
    rNote;
    gNote;
    bNote;

    constructor(name, rNote, gNote, bNote)
    {
        this.name = name;
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.rNote = rNote;
        this.gNote = gNote;
        this.bNote = bNote;
        this.element = document.querySelector(`#${name}`);
    }



    displayColor()
    {
        this.element.style.backgroundColor = `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

}