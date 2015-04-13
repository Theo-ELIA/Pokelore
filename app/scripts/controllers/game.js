'use strict';

/**
 * @ngdoc function
 * @name pokeloreApp.controller:GameCtrl
 * @description
 * # GameCtrl
 * Controller of the pokeloreApp
 */
angular.module('pokeloreApp')
  .controller('GameCtrl', ['$scope','PokeApi',function ($scope,PokeApi) {
  
	
	var idAnswer; //The Id of the good answer
	$scope.bestScore = 0;
	$scope.isLoading = true;
	
	$scope.verifyAnswer = function(IDpokemon)
	{	
		console.log('Answer' + idAnswer);
		console.log('ID :'+ IDpokemon);
		if(IDpokemon == idAnswer)//If it's the goodAnswer
		{
			$scope.score++;
			initNewRound();
		}
		else
		{
			alert('Wrong choice :(, your score is '+$scope.score);
			if($scope.score > $scope.bestScore)
			{
				$scope.bestScore = $scope.score;
			}
			initGame();
		}
	}
	
	function initGame()
	{
		$scope.score = 0;
		initNewRound();
	}
	function initNewRound()
	{
		$scope.arrayPokemon = [];
		$scope.lore = '';
		$scope.isLoading = true;
		PokeApi.randomArrayPokemon(NB_POKEMON_DISPLAYED,displayGame);
	}
	function displayGame(arrayPokemon)
	{
		
		var i = 0; 
		while($scope.lore == "" && i < arrayPokemon.length)
		{
			if (arrayPokemon[i].lore != "" && arrayPokemon[i].lore)
			{
				$scope.lore = arrayPokemon[i].lore;
				idAnswer = i;
				$scope.lore = censorNameInDescription(arrayPokemon[i].lore,arrayPokemon[i].name)
				console.log("DisplayGame");
				console.log(arrayPokemon);
			}
			i++;
		}
		if($scope.lore == "") //Si on trouve rien on reset l'Array
		{
			PokeApi.randomArrayPokemon(NB_POKEMON_DISPLAYED,afficherPokemon);
		}
		$scope.arrayPokemon = arrayPokemon;
		$scope.isLoading = false;
	}
	function censorNameInDescription(description, pokemonName)
	{
		var regex = new RegExp(pokemonName,'i')
		return description.replace(regex,'???')
	}
	
	function afficherErr(objet)
	{
		var string = String(objet);
		console.log('Erreur : ' +  objet);
	}

	initGame();
	
  }]);
