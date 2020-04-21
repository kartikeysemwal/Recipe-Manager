import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import {elements, renderLoader, clearLoader} from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";


const state = {};

//Search controller

const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
    //const query = "pizza";
    //console.log(query);

    if(query){
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            // 4) Search for recipes
            await state.search.getResults();
    
            // 5) Render results on UI
            clearLoader();
            searchView.renderResult(state.search.result);
        }catch(error){
            console.log("Something went wrong with the search");
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResult(state.search.result, goToPage);
    }
});

//Recipe Controller

const controlRecipe = async () => {
    const id = window.location.hash.replace("#","");

    if(id){

        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search)
            searchView.highlightSelected(id);

        state.recipe = new Recipe(id);

        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            state.recipe.calcTime();
            state.recipe.calServings();
    
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch(error){
            alert("Error processing the recipe");
        }

    }
};

//Window global event listner for change of hash
// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

//List controller

const controlList = () => {
    //Create a new list if there is no list
    if(!state.list){
        state.list = new List();
    }

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.rederItems(item);
    });
};

elements.shopping.addEventListener("click", (event) => {
    const id = event.target.closest(".shopping__item").dataset.itemid;

    if(event.target.matches(".shopping__delete, .shopping__delete *")){
        //Delete it from the state
        state.list.deleteItem(id);
        //Delete it from the UI
        listView.deleteItem(id);
    } else if(event.target.matches(".shopping__count-value")){
        const val = parseFloat(event.target.value);
        state.list.updateCount(id, val);
    }
});

const controlLike = () => {
    if(!state.likes){
        state.likes = new Likes();
    }

    const currentId = state.recipe.id;
    //If not liked
    if(!state.likes.isLiked(currentId)){
        //Add like to state
        const like = state.likes.addLike(currentId, state.recipe.title, state.recipe.author, state.recipe.img);

        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to the UI list
        likesView.renderLike(like);

        //If liked
    } else{
        //Remove like to state
        state.likes.deleteLike(currentId);

        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like from the UI list
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


elements.recipe.addEventListener("click", (e) => {
    if(e.target.matches(".btn-decrease, .btn-decrease *")){
        if(state.recipe.servings > 1){
            state.recipe.updateServings("dec");
            recipeView.clearRecipe();
            recipeView.renderRecipe(state.recipe);
        }
    } else if(e.target.matches(".btn-increase, .btn-increase *")){
        state.recipe.updateServings("inc");
        recipeView.clearRecipe();
        recipeView.renderRecipe(state.recipe);  
    } else if(e.target.matches(".recipe__btn--add, .recipe__btn--add *")){
        controlList();
    } else if(e.target.matches(".recipe__love, .recipe__love *")){
        controlLike();
    }
});

window.addEventListener("load", () => {
    //Testing
    state.likes = new Likes();

    state.likes.readStorage();
    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    });

    likesView.toggleLikeMenu(state.likes.getNumLikes());
});