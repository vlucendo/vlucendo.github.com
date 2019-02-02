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
        this._raf = 0;
    }

    _run()
    {
        //llamamos al requestAnimationFrame con una función
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
        
        //si el ticker no está activo lo hacemos correr
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
        //nos aseguramos de que props y options sean objetos
        props = props || {};
        options = options || {};

        //estado pausado
        this._paused = options.paused || false;

        //deltas, tiempos y progreso
        this._currentDelta = 0;
        this._prevDelta = 0;
        this._startTime = 0;
        this._progress = 0;

        //precision decimal deseada
        this._precision = options.precision || 4;

        //duración en milisegundos
        this._duration = duration * 1000;

        //delay en milisegundos
        this._delay = delay * 1000;

        //ease con un default
        this._ease = options.ease ? eases[options.ease] : eases['Power3.inOut'];
        
        //hooks
        this._onComplete = options.onComplete || noop;

        //aceptamos un nodelist o array de elementos
        const elements = (is.nodeList(els) || is.array(els)) ? els : [els];

        //cogemos las keys de las propiedades
        const properties = Object.keys(props);

        //creamos el array donde guardaremos los elementos, sus propiedades a animar, etc
        this._els = [];

        //iteramos los elementos
        for(let i = 0; i < elements.length; i++)
        {
            //creamos un objeto para cada elemento
            const elObj = { el: elements[i], properties: [] };

            //iteramos las propiedades a animar del elemento
            for(let j = 0; j < properties.length; j++)
            {
                //creamos un objeto por cada propiedad
                const propObj = { name: properties[j] };

                //detectamos si es un transform
                if(validTransforms.includes(propObj.name))
                {
                    propObj.type = tweenTypes.TRANSFORM;

                    //creamos un transform cache en caso de que no exista
                    if(!elObj.el._transformCache)
                        elObj.el._transformCache = {};
                }
                else if(propObj.name in elObj.el.style)
                {
                    propObj.type = tweenTypes.CSS;
                }

                //guardamos from, to y la unidad de la animación
                propObj.from = props[propObj.name][0];
                propObj.to = props[propObj.name][1];
                propObj.unit = props[propObj.name][2];

                //guardamos la propiedad a animar
                elObj.properties.push(propObj);
            }

            //guardamos el elemento a animar
            this._els.push(elObj);
        }

        //lo reproducimos automáticamente?
        if(!this._paused)
        {
            this._paused = true;
            this.play();
        }
    }

    _tick(time)
    {
        //si tiene el tiempo de comienzo se lo guardamos
        if(!this._startTime)
            this._startTime = time;

        //calculamos el delta time
        const delta = this._currentDelta + time - this._startTime;

        //lo guardamos en caso de usar pause() y luego play()
        this._prevDelta = delta;

        //si el tiempo pasado el inferior al delay no hacemos nada
        if(delta < this._delay)
            return;

        //calculamos el progreso del meneo
        this._progress = Math.max(0, Math.min(1, (delta - this._delay) / this._duration));

        //llamamos a la función que actualiza los elementos con respecto al progreso
        this._updateEls();

        //si el meneo ha terminado lo paramos y llamamos a un hook de ejemplo 
        if(delta >= (this._delay + this._duration))
        {
            this.pause();
            this._onComplete();
        }
    }

    _updateEls()
    {
        //obtenemos el valor del ease para el progreso actual
        const eased = this._ease(this._progress);
    
        //recorremos los elementos
        for(let i = 0; i < this._els.length; i++)
        {
            //creamos un array de transforms
            const transforms = [];
    
            //recorremos las propiedades
            for(let j = 0; j < this._els[i].properties.length; j++)
            {
                //cogemos los datos
                const data = this._els[i].properties[j];
    
                //obtenemos le valor interpolado entre from y to con la función lerp
                //y nos quedamos con los decimales deseados
                const val = round(lerp(data.from, data.to, eased), this._precision);
    
                //guardamos el valor en el array de transforms o se 
                //lo ponemos directamente en caso de no ser un transform
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
    
            //si no hay transforms pasamos al siguiente elemento
            if(transforms.length === 0)
                continue;
    
            //cogemos la caché de transforms del elemento
            const cache = Object.assign({}, this._els[i].el._transformCache);
    
            //la sobreescribimos con los nuevos transforms
            for(let j = 0; j < transforms.length; j++)
                cache[transforms[j][0]] = transforms[j][1];
    
            //iniciamos el string de transforms
            let transformString = '';
    
            //IMPORTANTE: recorremos los posibles transforms en un orden determinado para
            //construir la cadena de transforms
            for(let j = 0; j < validTransforms.length; j++)
            {
                //si existe en la caché lo ponemos
                if(cache[validTransforms[j]])
                    transformString += validTransforms[j] + '(' + cache[validTransforms[j]] + ') ';
            }
    
            //sobreescribimos la caché
            this._els[i].el._transformCache = cache;
    
            //ponemos al elemento su transform string
            this._els[i].el.style.transform = transformString;
        }
    }

    play()
    {
        if(!this._paused)
            return this;

        //ponemos estado
        this._paused = false;

        //reseteamos tiempo de comienzo
        this._startTime = 0;

        //asignamos prevDelta a currentDelta, esto es necesario
        //por si pausamos el meneo y luego lo queremos seguir
        //reproduciendo desde el punto que lo dejamos
        this._currentDelta = this._prevDelta;

        //añadimos el meneo al ticker
        ticker._add(this);

        return this;
    }

    pause()
    {
        if(this._paused)
            return this;

        //quitamos el meneo del ticker
        ticker._remove(this);

        //ponemos estado
        this._paused = true;

        return this;
    }

    reset()
    {
        //reseteamos tiempos y progreso
        this._currentDelta = 0;
        this._prevDelta = 0;
        this._startTime = 0;
        this._progress = 0;

        return this;
    }

    restart()
    {
        //pause, reset and play
        return this.pause().reset().play();
    }
}