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
        new StripLight("cabLeftOut", 48,49,50, 42),
        new StripLight("cabLeftIn", 45,46,47, 51),
        new StripLight("cabRightIn", 42,43,44, 60),
        new StripLight("cabRightOut", 39,40,41, 69),
        new StripLight("frontLeft", 36,37,38, 78),
        new StripLight("frontRight", 33,34,35, 33)
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

    if (event.data[0] == 144 || event.data[0] == 128)
    {
        if (messageName === masterDevice)
        {
            for (let i = 0; i < lights.length; i++)
            {
                if (event.data[1] === lights[i].rNote)
                {
                    lights[i].setRed(event.data[2] * 2);
                    lights[i].displayColor();
                }

                if (event.data[1] === lights[i].gNote)
                {
                    lights[i].setGreen(event.data[2] * 2);
                    lights[i].displayColor();
                }

                if (event.data[1] === lights[i].bNote)
                {
                    lights[i].setBlue(event.data[2] * 2);
                    lights[i].displayColor();
                }
            }
        }

        else if (messageName === redDevice)
        {
            for (let i = 0; i < lights.length; i++)
            {
                if (lights[i] instanceof StripLight)
                {
                    if (event.data[1] >= lights[i].segStartNote && event.data[1] <= lights[i].segStartNote + 7)
                    {
                        let seg = lights[i].getSegment(event.data[1] - lights[i].segStartNote);
                        seg.setRed(event.data[2] * 2);
                        seg.displayColor();
                    }
                }
            }
        }

        else if (messageName === greenDevice)
        {
            for (let i = 0; i < lights.length; i++)
            {
                if (lights[i] instanceof StripLight)
                {
                    if (event.data[1] >= lights[i].segStartNote && event.data[1] <= lights[i].segStartNote + 7)
                    {
                        let seg = lights[i].getSegment(event.data[1] - lights[i].segStartNote);
                        seg.setGreen(event.data[2] * 2);
                        seg.displayColor();
                    }
                }
            }

        }

        else if (messageName === blueDevice)
        {
            for (let i = 0; i < lights.length; i++)
            {
                if (lights[i] instanceof StripLight)
                {
                    if (event.data[1] >= lights[i].segStartNote && event.data[1] <= lights[i].segStartNote + 7)
                    {
                        let seg = lights[i].getSegment(event.data[1] - lights[i].segStartNote);
                        seg.setBlue(event.data[2] * 2);
                        seg.displayColor();
                    }
                }
            }

        }
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

    setRed(value)
    {
        this.r = value;
    }

    setGreen(value)
    {
        this.g = value;
    }

    setBlue(value)
    {
        this.b = value;
    }

}


class StripLight extends Light
{
    segments;
    segStartNote;

    constructor(name, rNote, gNote, bNote, segStartNote)
    {

        super(name,rNote,gNote,bNote);

        this.segStartNote = segStartNote;
        this.segments =
        [
            new StripSegment(name,1,segStartNote),
            new StripSegment(name,2,segStartNote+1),
            new StripSegment(name,3,segStartNote+2),
            new StripSegment(name,4,segStartNote+3),
            new StripSegment(name,5,segStartNote+4),
            new StripSegment(name,6,segStartNote+5),
            new StripSegment(name,7,segStartNote+6),
            new StripSegment(name,8,segStartNote+7)
        ];
    }

    displayColor()
    {
        this.element.style.backgroundColor = `rgb(${this.r}, ${this.g}, ${this.b})`;
        for (let i = 0; i < this.segments.length; i++)
        {
            this.segments[i].displayColor();
        }
    }

    getSegment(index)
    {
        return this.segments[index];
    }

    setRed(value)
    {
        for (let i = 0; i < this.segments.length; i++)
        {
           this.segments[i].setRed(value);
        }
    }

    setGreen(value)
    {
        for (let i = 0; i < this.segments.length; i++)
        {
           this.segments[i].setGreen(value);
        }
    }

    setBlue(value)
    {
        for (let i = 0; i < this.segments.length; i++)
        {
           this.segments[i].setBlue(value);
        }
    }
}

class StripSegment extends Light
{
    constructor(name, index, note)
    {
        super(name,note,note,note);
        this.element = document.querySelector(`#${name}${index}`);
    }
}