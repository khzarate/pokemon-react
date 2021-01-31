import React, {Component, useEffect} from 'react';
import uuid from 'react-uuid'
import './App.css'
import Swal from 'sweetalert2'

const LOCAL_STORAGE_KEY = 'ReactPokemon.MyPokemon';

function ListPoke(props){
  return (
  <>
  <div class="row">
    <div class="col-6">
      <div class="card">
        <div class="card-body poke-name">
              <h5 class="card-title">{props.pokemon.id + '. ' + props.pokemon.name}</h5>
        </div>
      </div>
    </div>
    <div class="col-6" onClick={props.onClick}>
        <div class="card">
        <div class="card-body text-center">
            <img src={props.pokemon.image}/>
        </div>
      </div>
    </div>
  </div>
  <div class="row details" className="poke-details"></div>
  </>
  )
}

function DisplayPoke(props){
  return (
    <div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body text-center">
            <img src={props.pokedata.image} id="pokedetails_img"/>
          </div>
        </div>
        <div class="col-12">
          <table class="table text-left">
            <tr>
            <td><b>ID</b></td>
              <td>{(props.pokedata.data.data.pokemon.id)}</td>
            </tr>
            <tr>
              <td><b>Name</b></td>
              <td>{(props.pokedata.data.data.pokemon.name)}</td>
            </tr>
            <tr>
              <td><b>Type(s)</b></td>
              <td>{(props.poketypes).join(', ')}</td>
            </tr>
            <tr>
              <td><b>Moves</b></td>
              <td>{(props.pokemoves).join(', ')}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
        <div class="col-12">
        <div class="card">
          <div class="btn-group" role="group" aria-label="Basic example">
            <button class="btn btn-warning" onClick={props.onClick}>Back</button> 
            <button class="btn btn-success" onClick={props.catch}>Catch</button>
          </div>
        </div>
        </div>
    </div>
    </div>
  );
}


//Component for Displaying My Pokemon List
function MyPokemon(props){
  return(
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-3">
            <img src={props.data.PokeImg}/>
          </div>
          <div class="col-9">
            <ul>
              <li><b>{props.data.PokeNickname}</b>{' ('+ props.data.PokeName+')'}</li>
              <li>{props.data.PokeGender}</li>
              <li>{(props.data.PokeTypes).join(', ')}</li>
              <li>{(props.data.PokeMoves).join(', ')}</li>
            </ul>
            <button class="btn btn-sm btn-danger btn_release float-right" onClick={props.onClick}>Release</button>
          </div>
        </div>
      </div>
    </div>
  );
}


class PokeMain extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        pokemon: [],
        myPokemon: [],
        PokeDetails: [],
        ViewList: false,
      }
    }

    componentDidMount() {
        const MyPokemon = localStorage.getItem(LOCAL_STORAGE_KEY);
        if(MyPokemon) this.setState({myPokemon: JSON.parse(MyPokemon)})

        //Fetch Pokemons from PokeAPI using GraphQL
        const pokeQuery = `query pokemons { 
              pokemons(limit: 151, offset: 0) {
                results {
                  url
                  name
                  id
                  image
                }
              }
            }`;
        fetch('https://graphql-pokeapi.vercel.app/api/graphql', {
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: pokeQuery,
          }),
          method: 'POST',
        })
        .then(res => res.json())
        .then((data) => {
            this.setState({ pokemon: data.data.pokemons.results })
        })
        .catch(console.log)
    }

    //function for selecting 4 random moves for a pokemon
    ShuffleArray(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    createList(pokemon){
      const PokeID = uuid();
      return(
        <ListPoke id={PokeID} pokemon={pokemon} onClick={() => this.GetPokeDetails(pokemon.name, pokemon.image, PokeID)} />
      );
    }

    MyPokemonList(index, myPoke){
      return (
        <MyPokemon id={index} data={myPoke} onClick={() => this.ReleasePokemon(index)}/>
      );
    }


    BackToList(){
      const SetEmpty = [];
      this.setState({PokeDetails: SetEmpty, ViewList: false});
    }

    //Catch Pokemon function
    CatchPokemon(CatchID, PokeID, PokeName, PokeMoves, PokeTypes, PokeImg){
      const CatchRate = Math.floor((Math.random() * 2) + 1); //50% chance to catch
      const PokeGender = (CatchRate === 1) ? "male" : "female"; //gender decision based from random number generated
      let isCatched = (CatchRate === 1) ? true : false; 
      if(isCatched){
        Swal.fire({
          //Give Nickname to the pokemon caught
          title: 'Congrats! You Caught '+PokeName+'!',
          text: 'Please give it a nickname',
          icon: 'success',
          showCancelButton: true,
          cancelButtonText: "Don't Keep",
          showConfirmButton: true,
          confirmButtonText: 'Keep Pokemon',
          input: 'text',
        }).then((result) => {
          if(result.isConfirmed){
            let myPoke = {
              CatchID: CatchID,
              PokeID: PokeID,
              PokeName: PokeName,
              PokeNickname: result.value,
              PokeTypes: PokeTypes,
              PokeMoves: PokeMoves,
              PokeGender: PokeGender,
              PokeImg: PokeImg,
            }
            let mine = this.state.myPokemon;
            mine.push(myPoke);
            this.setState({myPokemon: mine})
            this.BackToList();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state.myPokemon))
          } else {
            Swal.fire({
              title: PokeName + ' will be released back into the wild!',
              icon: 'info',
              text: 'Bye-bye '+PokeName+'!',
              timer: 2000,
              timerProgressBar: true
            });
          }
        });
      } else {
        Swal.fire({
          //Good Luck Next Time!
          title: 'Failed to Catch '+PokeName+'! Try harder!',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true
        });
      }
    }

    //Function to Release Pokemon from MyPokemon List
    ReleasePokemon(index){
      Swal.fire({
        icon: 'question',
        title: 'Are you sure you want to release this Pokemon?',
        showConfirmButton: true,
        showCancelButton: true
      }).then((result) =>{
          if(result.isConfirmed){
            let myPoke = this.state.myPokemon;
            myPoke.splice(index, 1);
            this.setState({myPokemon: myPoke})
            Swal.fire({
              icon: 'success',
              title: 'Succesfully Released Pokemon!'
            })
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state.myPokemon))
          }
      });
    }

    //Get a pokemon's details when viewing the pokemon
    GetPokeDetails(name, image, PokeID){
      const pokeQuery = `query pokemon($name: String!) {
        pokemon(name: $name) {
          id
          name
          abilities {
            ability {
              name
            }
          }
          moves {
            move {
              name
            }
          }
          types {
            type {
              name
            }
          }
          message
          status
        }
      }`;
      const params = {
        name: name,
      };
    
      fetch('https://graphql-pokeapi.vercel.app/api/graphql', { //fetch data from PokeAPI using GraphQL
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: pokeQuery,
        variables: params,
      }),
      method: 'POST',
      })
      .then(res => res.json())
      .then((data) => {
        const poke = {
          data: data,
          image: image,
          PokeID: PokeID
        }
        this.setState({
          PokeDetails: poke
        })

      })
      .catch(console.log);   
    }

    ShowMyPokemon(){
      if(!this.state.ViewList){
        this.setState({ViewList: true});
      }
      return(
        <div>
          <center><h1>My Pokemon</h1></center>
          <center><h3>Caught: {(this.state.myPokemon).length}</h3></center>
          <div><button class="btn btn-danger" onClick={() => this.BackToList()}>Back</button></div>
            {(this.state.myPokemon).map((poke, index) => (
              this.MyPokemonList(index, poke)
            ))}
        </div>
      );
    }

    ShowList(){
      return (
        <div>
          <center><h1>Pokemon List</h1></center>
          <center><h3>Total Pokemon: {(this.state.pokemon).length}</h3></center>
          <center><h3>Caught: {(this.state.myPokemon).length}</h3></center>
          <div><button class="btn btn-danger" onClick={() => this.ShowMyPokemon()}>My Pokemon</button></div>
            {(this.state.pokemon).map((poke) => (
              this.createList(poke)
            ))}
          </div>
      );
    }

    ShowDetails(){
      let TypeArray = [];
      const PokeTypes = this.state.PokeDetails.data.data.pokemon.types;
      for(let x = 0; x <= (PokeTypes).length-1; x++){
        TypeArray[x] = PokeTypes[x].type.name;
      }

      let MovesArray = [];
      const PokeMoves = this.ShuffleArray(this.state.PokeDetails.data.data.pokemon.moves);
      for(let x = 0; x <= 3; x++){
        MovesArray[x] = PokeMoves[x].move.name;
      }

      return (
        <DisplayPoke pokedata={this.state.PokeDetails} poketypes={TypeArray} pokemoves={MovesArray} onClick={() => this.BackToList()} catch={() => this.CatchPokemon(this.state.PokeDetails.PokeID, this.state.PokeDetails.data.data.pokemon.id, this.state.PokeDetails.data.data.pokemon.name, MovesArray, TypeArray, this.state.PokeDetails.image)}/>
      );
    }

    RenderDisplay(){
      let Render = '';
      if(this.state.ViewList){
        Render = this.ShowMyPokemon();
      } else {
        Render = ((this.state.PokeDetails).length < 1) ? this.ShowList() : this.ShowDetails();
      }
      return (
        Render
      )
    }

    render() {
        return (
          this.RenderDisplay()
        )
    }

}

function App() {
  return (
    <PokeMain/>
  )
}

export default App;
