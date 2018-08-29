import Browser
import Html exposing (Html)
import Html.Events as Events


type Msg
    = Increment 
    | Decrement


initialModel : Int
initialModel = 0


update : Msg -> Int -> Int
update msg model = 
    case msg of
        Increment -> 
            model + 1
        
        Decrement -> 
            model - 1


view : Int -> Html Msg
view model =  
    Html.main_ 
        [] 
        [ Html.button 
            [ Events.onClick Decrement ] 
            [ Html.text "-" ] 
        , Html.text <| String.fromInt model
        , Html.button 
            [ Events.onClick Increment ] 
            [ Html.text "+" ]
        ]


main : Program () Int Msg
main = 
    Browser.sandbox
        { init = initialModel
        , view = view
        , update = update
        }