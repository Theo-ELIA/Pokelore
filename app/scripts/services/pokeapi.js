'use strict';

/**
 * @ngdoc service
 * @name pokeloreApp.PokeApi
 * @description
 * # pokeapi
 * Service in the pokeloreApp.
 */

angular.module('pokeloreApp')
  .service('PokeApi', function ($http,$q) 
  {
    // AngularJS will instantiate a singleton by calling "new" on this function
	var URI_POKEDEX = '/api/v1/pokedex/1';
	function PokeApi()
	{
		this._domain =  'http://pokeapi.co' ;
		this._cachedData = {};
	}
	
	PokeApi.prototype.buildUrlFromUri = function(uri)
	{
		if(uri[0] !== '/')
		{
			uri = '/' + uri;
		}
		return this._domain + uri + '?callback=JSON_CALLBACK';
	};
	/*
	* uri = uri of the Api (String)
	* OnSuccess Callback function if it's successful
	* OnError Callback function if there's something wrong
	*/
	PokeApi.prototype.get = function(uri,onSuccess, onError)
	{
		//If there's not OnSccess callback (Thanks Kor)
		if (!onSuccess)
		{
			console.error('You have to use a callback function with PokeApi.get');
			return this;
		}
		
		if(this._cachedData[uri])
		{
			onSuccess(this._cachedData[uri]);
			return this;
		}
		var url = this.buildUrlFromUri(uri);
		var promise = $http.jsonp(url);
		var that = this;
		promise.success(function(data)
		{
			that._cachedData = data;
			
			onSuccess(data);
		});
		
		if(onError) //If onErroror is defined we use him as an error function for the promise
		{
			promise.error(onError);
		}
		
		return this;
	};
	
	
	/*
	* Return the list of Pokemon
	*/
	
	
	PokeApi.prototype.pokedex = function(onSuccess, onError)
	{
		return this.get(URI_POKEDEX,onSuccess,onError);
	};
	
	/*
	*	Return a random Pokemon from the Pokedex
	*/
	PokeApi.prototype.randomPokemon = function(onSuccess, onError)
	{
		//We verify there's a success callback function
		if(!onSuccess)
		{
			console.error('Error : No success callback function with PokeApi.randomPokemon');
			return this;
		}
		var that = this;
		return that.pokedex(function(pokedex)
		{
			var randomPokemon	=	pokedex.pokemon[Math.floor(Math.random() * pokedex.pokemon.length)];
					
			that.get(randomPokemon.resource_uri, onSuccess, onError);
					
		}, onError);
			
	};
	
	
	//Return an array of nbPokemon entries
	PokeApi.prototype.randomArrayPokemon = function(nbPokemon,onSuccess,onError)
	{
		//We verify there's a success callback function
		if(!onSuccess)
		{
			console.error('Error : No success callback function with PokeApi.randomArrayPokemon');
			return this;
		}
		else if(!nbPokemon)
		{
			console.error('Error : No nbPokemon for randomPokemon');
			return this;
		}
		else if(nbPokemon <= 0)
		{
			console.error('Error : NbPokemon lower than or equals to 0');
			return this;
		}
		
		
		var arrayPokemon = []; //The Array we want to return by callback
		var spriteURL;
		var arrayPromiseInfo = []; 
		var arrayPromisePokemon = []; //All the promise we need
		var arrayPromise = [];
		var addSpritePokemon = function(arrayPokemon,idArray,spriteURI)
		{
			arrayPromiseInfo[arrayPromiseInfo.length] = $q(function(resolve,reject)
			{
				that.get(spriteURI,function(spriteJSON)
				{
					arrayPokemon[idArray].sprite = that._domain + spriteJSON.image;
					resolve();
				},reject);
			});
		};
		
		var addLorePokemon = function(arrayPokemon,idArray,descriptionURI)
		{
			arrayPromiseInfo[arrayPromiseInfo.length] = $q(function(resolve,reject)
			{
				console.log("Description n°"+idArray);
				that.get(descriptionURI,function(JSONdescription)
				{
					arrayPokemon[idArray].lore = JSONdescription.description;
					resolve();
				},reject);
			});
		};
			
			
		var that = this;
		var i;
		var idArrayGoodAnswer = Math.floor(Math.random() * nbPokemon); //This number show 
		for(i=0; i<nbPokemon; i++)
		{
			
			//We generate a random Pokemon;
				
			arrayPromisePokemon[arrayPromisePokemon.length] = $q(function(resolve,reject) //We create a promise for Each Random¨Pokemon
			{
				var idCurrent = i;
				that.randomPokemon(function(pokemon)
				{
					
					var name = pokemon.name;
					arrayPokemon[idCurrent] = new Object();
					if(! pokemon.sprites || ! pokemon.sprites.length) //If the Pokemon doesn't have a sprite
					{
						arrayPokemon[idCurrent].sprite = "./images/missingno.png";
					}
					else // If it does we load the sprite
					{
						var spriteURI = pokemon.sprites[pokemon.sprites.length-1].resource_uri;
						addSpritePokemon(arrayPokemon,idCurrent,spriteURI,onError);
					}
					
					if(idCurrent == idArrayGoodAnswer) //If it's the Id is the good answer
					{
						var descriptionURI;
						if(!pokemon.descriptions || !pokemon.descriptions.length) //If this Pokemon doesn't have a description but was randomly chosen to be 
						{
							if(idCurrent+1 < nbPokemon) //If the there are still Pokemon left in the Array, the next one is the good answer 
							{
								idArrayGoodAnswer++;
							}
							else //If we're at the last position of the array
							{
								var isPokemonFound = false;
								var j = 0
								console.log(arrayPokemon);
								while(!isPokemonFound && j<nbPokemon-1) //While we don't found a match we browse the array
								{
									if(arrayPokemon[j].descriptions)
									{
										idArrayGoodAnswer = j;
										isPokemonFound = true;
										addLorePokemon(arrayPokemon,j,descriptionURI,onError);
									}
								}
							}
						}
						else//If the Pokemon chosen to be the good answer
						{
			
							descriptionURI = pokemon.descriptions[pokemon.descriptions.length-1].resource_uri
							
							addLorePokemon(arrayPokemon,idCurrent,descriptionURI,onError);
						}
					}
					else
					{
						arrayPokemon[idCurrent].lore = "";
					}
					arrayPokemon[idCurrent].id = idCurrent;
					arrayPokemon[idCurrent].name = name;
					resolve();
					

				},reject);
			});
		}
		
		$q.all(arrayPromisePokemon).then(function()
		{
			$q.all(arrayPromiseInfo).then(
			function()
			{
				onSuccess(arrayPokemon);
			},onError);
		
		},onError); //Returns a promise
		
		return this;
		
	};
	
	
	return new PokeApi();
});
