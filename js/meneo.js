/*

Ticker

*/


class _ticker
{
    constructor()
    {
        //array de meneos
        this._meneos = [];

        //requestAnimationFrame variable
        this._raf = undefined;
    }

    _run()
    {
        //call requestAnimationFrame with a bound function and store it for cancelation
        this._raf = requestAnimationFrame((time) =>
        {
            //numero de meneos
            const meneosNum = this._meneos.length;

            //si hay alguno
            if(meneosNum > 0)
            {
                //continua el requestAnimationFrame
                this._run();
                
                //itera los meneos pasándoles el tiempo
                for(let i = 0; i < this._meneos.length; i++)
                    this._meneos[i]._tick(time);
            }
            else
            {
                this._raf = 0;
            }
        });
    }

    _add(meneo)
    {
        this._meneos.push(meneo);
        
        ///if the ticker is not running make it run
        if(!this._raf)
            this._run();
    }

    _remove(meneo)
    {
        const index = this._meneos.indexOf(meneo);

        if(index !== -1)
            this._meneos.splice(index, 1);
    }

}

const ticker = new _ticker();



/*

Eases

*/


const e =
{
    Power0:
    {
        none: function(v)
        {
            return v;
        }
    },

    Power1:
    {
        in: function(v)
        {
            return v * v;
        },

        out: function(v)
        {
            return v * (2 - v);
        },

        inOut: function(v)
        {
            if((v *= 2) < 1)
                return 0.5 * v * v;
            else
                return -0.5 * (--v * (v - 2) - 1);
        }
    },

    Power2:
    {
        in: function(v)
        {
            return v * v * v;
        },

        out: function(v)
        {
            return --v * v * v + 1;
        },

        inOut: function(v)
        {
            if((v *= 2) < 1)
                return 0.5 * v * v * v;
            else
                return 0.5 * ((v -= 2) * v * v + 2);
        }
    },

    Power3:
    {
        in: function(v)
        {
            return v * v * v * v;
        },

        out: function(v)
        {
            return 1 - (--v * v * v * v);
        },

        inOut: function(v)
        {
            if((v *= 2) < 1)
                return 0.5 * v * v * v * v;
            else
                return -0.5 * ((v -= 2) * v * v * v - 2);
        }
    },

    Power4:
    {
        in: function(v)
        {
            return v * v * v * v * v;
        },

        out: function(v)
        {
            return --v * v * v * v * v + 1;
        },

        inOut: function(v)
        {
            if((v *= 2) < 1)
                return 0.5 * v * v * v * v * v;
            else
                return 0.5 * ((v -= 2) * v * v * v * v + 2);
        }
    },

    Sine:
    {
        in: function(v)
        {
            if(v === 0)
                return 0;
            else if(v === 1)
                return 1;
            else
                return 1 - Math.cos(v * Math.PI / 2);
        },

        out: function(v)
        {
            if(v === 0)
                return 0;
            else if(v === 1)
                return 1;
            else
                return Math.sin(v * Math.PI / 2);
        },

        inOut: function(v)
        {
            if(v === 0)
                return 0;
            else if(v === 1)
                return 1;
            else
                return 0.5 * (1 - Math.cos(Math.PI * v));
        }
    },

    Expo:
    {
        in: function(v)
        {
            if(v === 0)
                return 0;
            else
                return Math.pow(2, 10 * (v - 1));
        },

        out: function(v)
        {
            if(v === 1)
                return 1;
            else
                return 1 - Math.pow(2, -10 * v);
        },

        inOut: function(v)
        {
            if(v === 0)
                return 0;
            else if(v === 1)
                return 1;
            else if((v *= 2) < 1)
                return 0.5 * Math.pow(2, 10 * (v - 1));
            else
                return 0.5 * (2 - Math.pow(2, -10 * (v - 1)));
        }
    }
};

const eases =
{
    'Power0.none': e.Power0.none,

    'Power1.in': e.Power1.in,
    'Power1.out': e.Power1.out,
    'Power1.inOut': e.Power1.inOut,

    'Power2.in': e.Power2.in,
    'Power2.out': e.Power2.out,
    'Power2.inOut': e.Power2.inOut,

    'Power3.in': e.Power3.in,
    'Power3.out': e.Power3.out,
    'Power3.inOut': e.Power3.inOut,

    'Power4.in': e.Power4.in,
    'Power4.out': e.Power4.out,
    'Power4.inOut': e.Power4.inOut,

    'Sine.in': e.Sine.in,
    'Sine.out': e.Sine.out,
    'Sine.inOut': e.Sine.inOut,

    'Expo.in': e.Expo.in,
    'Expo.out': e.Expo.out,
    'Expo.inOut': e.Expo.inOut
};



/*


Meneo


*/

const noop = function(){};

const is = {
    array: a => Array.isArray(a),
    nodeList: a => a instanceof NodeList || a instanceof HTMLCollection
};

const round = function(value, precision = 0)
{
    const p = Math.pow(10, precision);
    return Math.round(value * p) / p;
};

const lerp = function (value0, value1, t = 0)
{
    return (value0 * (1 - t)) + (value1 * t);
};

const tweenTypes = {
    TRANSFORM: 1,
    CSS: 2
};

const validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY', 'perspective'];

class meneo
{
    constructor(els, duration, props, options, delay)
    {
        //make sure props and options are objects when a false/null/undefined value is passed
        props = props || {};
        options = options || {};

        //paused state
        this._paused = options.paused || false;

        //start deltas, times and progress vars
        this._currentDelta = 0;
        this._prevDelta = 0;
        this._startTime = 0;
        this._progress = 0;

        //desired decimal precision
        this._precision = options.precision || 4;

        //duration (stored in miliseconds)
        this._duration = duration * 1000;

        //delay (stored in miliseconds)
        this._delay = delay * 1000;

        //ease with a default
        this._ease = options.ease ? eases[options.ease] : eases['Power3.inOut'];
        
        //hooks function
        this._onComplete = options.onComplete || noop;

        //create elements nodelist / array
        const elements = (is.nodeList(els) || is.array(els)) ? els : [els];

        //get the properties keys
        const properties = Object.keys(props);

        //create elements array
        this._els = [];

        //loop through the els
        for(let i = 0; i < elements.length; i++)
        {
            //create the object of the element
            const elObj = { el: elements[i], properties: [] };

            //loop through the properties
            for(let j = 0; j < properties.length; j++)
            {
                //create the object of the property
                const propObj = { name: properties[j] };

                //detect tween type
                if(validTransforms.includes(propObj.name))
                {
                    propObj.type = tweenTypes.TRANSFORM;

                    //create transform cache if it doesn't exist
                    if(!elObj.el._transformCache)
                        elObj.el._transformCache = {};
                }
                else if(propObj.name in elObj.el.style)
                {
                    propObj.type = tweenTypes.CSS;
                }

                //save from, to and unit values
                propObj.from = props[propObj.name][0];
                propObj.to = props[propObj.name][1];
                propObj.unit = props[propObj.name][2];

                //save propObj
                elObj.properties.push(propObj);
            }

            //save the el and its properties
            this._els.push(elObj);
        }

        //play it?
        if(!this._paused)
        {
            this._paused = true;
            this.play();
        }
    }

    _tick(time)
    {
        if(!this._startTime)
            this._startTime = time;

        //calc delta
        const delta = this._currentDelta + time - this._startTime;

        //save previous delta in case the user pauses() and then plays()
        this._prevDelta = delta;

        //only do something after the delay
        if(delta < this._delay)
            return;

        //calculate tween progress
        this._progress = Math.max(0, Math.min(1, (delta - this._delay) / this._duration));

        //set tween in-between state
        this._tweenProgress();

        //if tween is finished, pause it
        if(delta >= (this._delay + this._duration))
        {
            this.pause();
            this._onComplete();
        }
    }

    _tweenProgress()
    {
        //get eased value of progress
        const eased = this._ease(this._progress);

        //loop the els
        for(let i = 0; i < this._els.length; i++)
        {
            //transforms array
            const transforms = [];

            //loop the properties
            for(let j = 0; j < this._els[i].properties.length; j++)
            {
                //get property data
                const data = this._els[i].properties[j];

                //get the lerped value between from and to values and round it to the desired precision
                const val = round(lerp(data.from, data.to, eased), this._precision);

                //set the values
                switch(data.type)
                {
                    case tweenTypes.TRANSFORM:
                        transforms.push([data.name, val + data.unit]);
                        break;
                    case tweenTypes.CSS:
                        this._els[i].el.style[data.name] = val + data.unit;
                        break;
                }
            }

            //if there are no transforms, move to the next el
            if(transforms.length === 0)
                continue;

            //copy element transform cache
            const cache = Object.assign({}, this._els[i].el._transformCache);

            //overwrite it with the new values
            for(let j = 0; j < transforms.length; j++)
                cache[transforms[j][0]] = transforms[j][1];

            //build transform string
            let transformString = '';

            //IMPORTANT: loop the valid transforms so the string is in the correct order
            for(let j = 0; j < validTransforms.length; j++)
            {
                //if it exists in the cache
                if(cache[validTransforms[j]])
                    transformString += validTransforms[j] + '(' + cache[validTransforms[j]] + ') ';
            }

            //save element cache
            this._els[i].el._transformCache = cache;

            //set transform string
            this._els[i].el.style.transform = transformString;
        }
    }

    play()
    {
        if(!this._paused)
            return this;

        //set flag
        this._paused = false;

        //set start time
        this._startTime = 0;

        //set current delta as the previous delta in case
        //the tween was paused and now restarted again
        this._currentDelta = this._prevDelta;

        //add it to the ticker
        ticker._add(this);

        //make this chainable
        return this;
    }

    pause()
    {
        if(this._paused)
            return this;

        //remove it from the ticker
        ticker._remove(this);

        //set flag
        this._paused = true;

        //make this chainable
        return this;
    }

    reset()
    {
        //reset start deltas, time and progress
        this._currentDelta = 0;
        this._prevDelta = 0;
        this._startTime = 0;
        this._progress = 0;

        //make this chainable
        return this;
    }

    restart()
    {
        //pause, reset and play
        return this.pause().reset().play();
    }
}