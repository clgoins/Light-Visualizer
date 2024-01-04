let masterDeviceSelect;
let redDeviceSelect;
let greenDeviceSelect;
let blueDeviceSelect;
let masterDevice;
let redDevice;
let blueDevice;
let greenDevice;

let drumLeft;
let drumRight;
let cabLeftIn;
let cabLeftOut;
let cabRightIn;
let cabRightOut;
let sideLeft;
let sideRight;
let frontLeft;
let frontRight;

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


    drumLeft = document.querySelector("#drumLeft");
    drumRight = document.querySelector("#drumRight");
    cabLeftIn = document.querySelector("#cabLeftIn");
    cabLeftOut = document.querySelector("#cabLeftOut");
    cabRightIn = document.querySelector("#cabRightIn");
    cabRightOut = document.querySelector("#cabRightOut");
    sideLeft = document.querySelector("#sideLeft");
    sideRight = document.querySelector("#sideRight");
    frontLeft = document.querySelector("#frontLeft");
    frontRight = document.querySelector("#frontRight");
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
    let red = 0;
    let green = 0;
    let blue = 0;
    let current;

    if (masterDevice === messageName)
    {
        if (event.data[0] == 144 || event.data[0] == 128)
        {
            switch(event.data[1])
            {
                case 68:
                    current = parseColor(drumLeft.style.backgroundColor);
                    red = event.data[2] * 2;
                    drumLeft.style.backgroundColor = `rgb(${red},${current[1]},${current[2]})`;
                    break;
                case 69:
                    green = event.data[2] * 2;
                    drumLeft.style.backgroundColor = `rgb(${red},${green},${blue})`;
                    break;
                case 70:
                    blue = event.data[2] * 2;
                    drumLeft.style.backgroundColor = `rgb(${red},${green},${blue})`;
                    break;
                default:
                    break;
            }
        }
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