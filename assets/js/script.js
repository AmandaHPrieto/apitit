/**
 * On attend que le DOM soit totalement chargé
 * */
$(document).ready(function () {

    // Selecteurs, retournant des objets jQuery
    const form = $('#form');

    init();

    /* Fonction d'initialisation des évènements */
    function init() {

        chargeIngredients();// au chargement de la page on récupère la liste des ingrédients

        form.on('submit', function (e) { // Lors de l'envoi du formulaire
            e.preventDefault();
            $("#liste-recettes > li").remove(); // on veut que lorsqu'on change d'ingrédient la liste de recette change (s'efface pour être remplacée)
            recettes();
        });
    }

    /* On crée une fonction pour vérifier qu'un ingrédient a bien été sélectionné et on associe un message d'erreur qui s'insèrera dans la balise span dédiée*/

    function verifSelection() {
        if ($(":selected").val() == "0") {
            $(".message-erreur").html("Please, select an ingredient in the list");
            return false;
        }
        else {
            $(".message-erreur").empty();
            return true;
        }
    }

    /* Chargement des recettes contenant l'ingrédient sélectionné */
    function recettes() {
        verifSelection()
        let url = ('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + $("option:selected").val());
        $.getJSON(url, function (data) { // Récupère les données json
            let recette = data.meals; //on définit la variable des recettes 
            /*on définit la fonction qui s'applique à chaque recette de notre json*/
            $.each(recette, function (i, recette) {
                let titreRecette = recette.strMeal; //on crée la variable pour récupérer le titre de la recette
                let image_recette = recette.strMealThumb; //celle pour récupérer l'image
                let adresse_recette = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + recette.idMeal + ""; //celle pour récupérer l'adresse

                /* on rattache les éléments qui nous intéressent à notre liste*/
                $('#liste-recettes').append(
                    '<li class="recette"><a href= "' + adresse_recette + '" >' + titreRecette + '</br><img class="img-recette" src= "' + image_recette + '"/></a></li>'
                );
                $('.img-recette').css({ 'width': "300px", 'height': "300px" }) //on redimensionne nos images
            })
        })
    }

    /* On crée une fonction qui va être appelée au chargement de la page dans la fonction init() et qui va intégrer la totalité des ingrédients dispobible dans la liste déroulante*/

    function chargeIngredients() {
        let url = ("https://www.themealdb.com/api/json/v1/1/list.php?c=list");
        $.getJSON(url, function (data) {
            let ingredient = data.meals;
            $.each(ingredient, function (i, ingredient) {
                $('#ingredient').append(
                    '<option class="ingredient" value="' + ingredient.strCategory + '"> ' + ingredient.strCategory + '</option>'
                )
            })
        })
    }

    /* Quand une recette est cliquée, on affiche les détails et on cache les autres recettes */

    $("#liste-recettes").on("click", function (e) {
        e.preventDefault(); //on empêche le chargement du lien vers le fichier JSON
        popup(); // Appelle la fonction popup
        let url = e.target.parentNode.getAttribute("href") || e.target.href;
        $.getJSON(url, function (data) {
            let recette = data.meals;
            $.each(recette, function (i, recette) {
                let titreRecette = recette.strMeal;
                $(".titre").html(titreRecette);
                let image_recette = recette.strMealThumb;
                $(".thumbnail").attr('src', image_recette);

                /* Mise en page des instructions */
                let instructions = recette.strInstructions;
                for (i = 0; i < 20; i++) {
                    instructions = instructions.replace("\r\n", "<br><br>")/*.replace("\n", "<br>")*/;
                }
                $(".instructions").html(instructions);

                /* Affichage du lien youtube, quand disponible */
                if (recette.strYoutube != "") {
                    $(".div-thumbnail").append(
                        '<a href="' + recette.strYoutube + '" class="video" title="video-recette" target="_blank">' +
                        '<img src="assets/images/logo-yt.png" class="logo-yt">Watch it!</a>')
                }


                /* Affichage des tags, quand disponibles */
                let pays = recette.strArea;
                let categorie = recette.strTags;
                $(".pays").html("📌 " + pays);
                if (categorie !== null && categorie !== "") {  // Ne pas afficher la catégorie si "null" ou vide        
                    $(".categorie").html("🥣 " + categorie)
                }

                /* Affichage des ingrédients */
                let ingredients = new Array(21);
                for (let i = 1; i < ingredients.length; i++) {
                    if ((recette["strMeasure" + i] !== null) && (recette["strIngredient" + i] !== null) && (recette["strMeasure" + i] !== "") && (recette["strIngredient" + i] !== "")) { // Si l'ingrédient est "null" -> ne pas afficher
                        let ingredients = recette["strMeasure" + i] + " " + recette["strIngredient" + i];
                        $(".recette-ingredients").append("<li>" + ingredients + "</li>");
                    }
                }
            })
        })
    })

    // Fonction pour le pop up, source : https://www.geeksforgeeks.org/how-to-generate-a-simple-popup-using-jquery/
    function popup() {
        $(".popup-container").toggle(); // pour ouvrir le popup
    }

    // Pour fermer le popup
    $(".popup-container").on("click", function () {
        $(".popup-container").toggle();
        clear();
    })


    /* Fonction permettant de nettoyer l'affichage si on veut revenir à la liste ou si on veut lancer une autre recherche*/
    function clear() {
        $(".recette-ingredients > li").remove();
        $(".instructions").empty();
        $(".titre").empty();
        $(".categorie").empty();
        $('.thumbnail').attr('src', '');
        $(".video").remove();
    }
})


