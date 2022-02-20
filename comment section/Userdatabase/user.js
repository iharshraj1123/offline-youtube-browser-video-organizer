var com_recent = document.getElementsByClassName('comments-summon-recent')[0]; 
var com_upvote = document.getElementsByClassName('comments-summon-mostupvoted')[0]; 
var com_downvote = document.getElementsByClassName('comments-summon-mostdownvoted')[0]; 


document.getElementsByClassName('com-recent')[0].addEventListener('click',function(){
    com_recent.classList.remove('hidemepls')
    if(!com_upvote.classList.contains('hidemepls')){com_upvote.classList.add('hidemepls')}
    if(!com_downvote.classList.contains('hidemepls')){com_downvote.classList.add('hidemepls')}

})


document.getElementsByClassName('com-mostupvoted')[0].addEventListener('click',function(){
    com_upvote.classList.remove('hidemepls')
    if(!com_recent.classList.contains('hidemepls')){com_recent.classList.add('hidemepls')}
    if(!com_downvote.classList.contains('hidemepls')){com_downvote.classList.add('hidemepls')}

})


document.getElementsByClassName('com-mostdownvoted')[0].addEventListener('click',function(){
    com_downvote.classList.remove('hidemepls')
    if(!com_upvote.classList.contains('hidemepls')){com_upvote.classList.add('hidemepls')}
    if(!com_recent.classList.contains('hidemepls')){com_recent.classList.add('hidemepls')}

})

function drop_menu(){
    document.getElementById('myDropdown').classList.toggle('noheighto')
}

function form_sum(x){
    if(x === 'pfp'){
        document.getElementsByClassName('change-form-div')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-pic')[0].classList.remove('hidemepls')
        document.getElementById('condition').value = 'pfp'
    }
    else if(x === 'desc'){
        document.getElementsByClassName('change-form-div')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-desc')[0].classList.remove('hidemepls')
        document.getElementById('condition').value = 'desc'
    }
    else if(x === 'pass'){
        document.getElementsByClassName('change-form-div')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-pass')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-pass')[1].classList.remove('hidemepls')
        document.getElementById('condition').value = 'pass'
    }
    else if(x === 'name'){
        
        document.getElementsByClassName('change-form-div')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-name')[0].classList.remove('hidemepls')
        document.getElementsByClassName('new-name')[1].classList.remove('hidemepls')
        document.getElementById('condition').value = 'name'
    }
    else {
        document.getElementsByClassName('change-form-div')[0].classList.add('hidemepls')
        if(!document.getElementsByClassName('new-name')[0].classList.contains('hidemepls')){
        document.getElementsByClassName('new-name')[0].classList.add('hidemepls')}

        if(!document.getElementsByClassName('new-name')[1].classList.contains('hidemepls')){
        document.getElementsByClassName('new-name')[1].classList.add('hidemepls')}

        if(!document.getElementsByClassName('new-pass')[0].classList.contains('hidemepls')){
        document.getElementsByClassName('new-pass')[0].classList.add('hidemepls')}

        if(!document.getElementsByClassName('new-pass')[1].classList.contains('hidemepls')){
        document.getElementsByClassName('new-pass')[1].classList.add('hidemepls')}

        if(!document.getElementsByClassName('new-desc')[0].classList.contains('hidemepls')){
        document.getElementsByClassName('new-desc')[0].classList.add('hidemepls')}

        if(!document.getElementsByClassName('new-pic')[0].classList.contains('hidemepls')){
        document.getElementsByClassName('new-pic')[0].classList.add('hidemepls')}

        document.getElementById('condition').value = ''
    }
    
}
  
  // Close the dropdown if the user clicks outside of it
function updatao(){
    let vid_divs = document.getElementsByTagName('video')
    for(i = 0; i < vid_divs.length; i++){
        vid_divs[i].volume = 0.5
        vid_divs[i].controls = true
        vid_divs[i].autoplay = false
    }
}

updatao()


//---------------------My equation library----------------------------//
/*
Creator = u/iharshraj ; Orignial File Created = 03-03-2020
last Modified = 05-03-2020

Put your codes in between <eqn-space></eqn-space> , only one such tag can be created

Although it wont matter much , I like to make least <eqn-space> tags , I just make 
1-2 big tags which covers my most of writing area.It wont affect your text
but be aware dont put entire <body> childnodes inside this tag it could hinder some processes
related to Html DOMs in javascript.

Just use it around text places.

*If you use Night mode for your websites ,
 make sure you turn <hr> tags white to make division slash visible
 set border-color for <table> white for determinants
 set border-color and background color for .mat-div1 (a class) and just background-color for .mat-div2 red or blue for matrices
 use !important for all above
 eg, 
      body.night hr , body.night table {
        border-color : white !important;
      }
      body.night .mat-div1 {
        border : 2px solid white !important;
        background-color: black !important;    (black or whatever color is ur night mode background)
      }
      body.night .mat-div2 {
        background-color: black !important;
      }



<------------Personal Notes------------------>
( = \u0028
) = \u0029
{ = \u007B
} = \u007D
[ = \u005B
] = \u005D
| = \u007C
/ = \u002F
\ = \u005C
+ = \u002B

<------------Calculus or High effort Operations--------->

Differentiation = {!d/dx} or {!d/dz} or etc

Integration = <integ>(a)->[b]</integ>

Division = <divide>{a+b+c+d}by[a+b]</divide>
      
limits ={!lim_x->0} or
        <limit>(x->0)</limit>

nCr or nPr = {!ncr} or {!npr}

^n = !!pn!!
_n = !!_n!!

<--------------------Chemistry---------------------->

First put it in <chem-eqn></chem-eqn>
^ = up arrow (for gases)
{!equilibrium} =  puts equilibrium sign
--UPTEXT__BELOWTEXT-> = reaction arrow
_ = base
_g = _(g)
_aq = _(aq)
_s = _(s)
*/

/*
Creator = u/iharshraj ; Orignial File Created = 03-03-2020
last Modified = 05-03-2020

Put your codes in between <eqn-space></eqn-space> , only one such tag can be created

Although it wont matter much , I like to make least <eqn-space> tags , I just make 
1-2 big tags which covers my most of writing area.It wont affect your text
but be aware dont put entire <body> childnodes inside this tag it could hinder some processes
related to Html DOMs in javascript.

Just use it around text places.

*If you use Night mode for your websites ,
 make sure you turn <hr> tags white to make division slash visible
 set border-color for <table> white for determinants
 set border-color and background color for .mat-div1 (a class) and just background-color for .mat-div2 red or blue for matrices
 use !important for all above
 eg, 
      body.night hr , body.night table {
        border-color : white !important;
      }
      body.night .mat-div1 {
        border : 2px solid white !important;
        background-color: black !important;    (black or whatever color is ur night mode background)
      }
      body.night .mat-div2 {
        background-color: black !important;
      }



<------------Personal Notes------------------>
( = \u0028
) = \u0029
{ = \u007B
} = \u007D
[ = \u005B
] = \u005D
| = \u007C
/ = \u002F
\ = \u005C
+ = \u002B

<------------Calculus or High effort Operations--------->

Differentiation = {!d/dx} or {!d/dz} or etc

Integration = <integ>(a)->[b]</integ>

Division = <divide>{a+b+c+d}by[a+b]</divide>
      
limits ={!lim_x->0} or
        <limit>(x->0)</limit>

nCr or nPr = {!ncr} or {!npr}

^n = !!pn!!
_n = !!_n!!

<--------------------Chemistry---------------------->

First put it in <chem-eqn></chem-eqn>
^ = up arrow (for gases)
{!equilibrium} =  puts equilibrium sign
--UPTEXT__BELOWTEXT-> = reaction arrow
_ = base
_g = _(g)
_aq = _(aq)
_s = _(s)


*/

function eqn_start(){
    //Basic symbols
   var ki;
   var global_divs_all = document.getElementsByTagName('eqn-space')
    var arrow = '-&gt;';
  
    var globt1 = '!!alpha'             //  α
    var globt2 = '!!beta'              //  β
    var globt3 = '!!gamma'             //  γ
    var globt4 = '!!delta'             //  Δ
    var globt5 = '!!delta-2'           //  δ
    var globt6 = '!!eta'               //  η
    var globt7 = '!!theta'             //  θ
    var globt8 = '!!lemda'             //  λ
    var globt9 = '!!lambda'            //  λ
    var globt10 = '!!pi'               //  π
    var globt11 = '!!phi'              //  φ
    var globt12 = '!!phi2'             //  Φ
    var globt13 = '!!psi'              //  Ψ
    var globt14 = '!!psi2'             //  ψ
    var globt15 = '!!chi'              //  χ
    var globt16 = '!!suscept'          //  χ
    var globt17 = '!!greek-x'          //  χ
    var globt18 = '!!greek-t'          //  τ
    var globt19 = '!!tau'              //  τ
    var globt20 = '!!omega'            //  ω
    var globt21 = '!!omega'            //  Ω
    var globt22 = '!!ohm'              //  Ω
    var globt23 = '!!sigma'            //  σ
    var globt24 = '!!sigma2'           //  Σ
    var globt25 = '!!sum'              //  Σ
    var globt26 = '!!rho'              //  ρ
    var globt27 = '!!nu'               //  ν
    var globt28 = '!!mu'               //  μ
    var globt29 = '!!upsilon'          //  υ
    var globt30 = '!!greek-u'          //  υ
    var globt31 = '!!greek-v'          //  ν
    var globt32 = '!!xi'               //  ξ
    var globt33 = '!!pi2'              //  Π
    var globt34 = '!!product'          //  Π
    var globt35 = '!!zeta'             //  ζ
    var globt36 = '!!epsilon'          //  ε
    var globt37 = '!!greek-e'          //  ε
    var globt38 = '!!kappa'            //  κ
    var globt39 = '!!greek-k'          //  κ
    var globt40 = '!!integration'      //  ∫
    var globt41 = '!!for-all'          //  ∀
    var globt42 = '!!there-exists'     //  ∃
    var globt43 = '!!ulta-A'           //  ∀
    var globt44 = '!!ulta-E'           //  ∃
    var globt45 = '!!since'            //  ∵
    var globt46 = '!!hence'            //  ∴
    var globt47 = '!!dot-product'      //  ⋅
    var globt48 = '!!ne'               //  ≠
    var globt49 = '!!='                //  ≠
    var globt50 = '!!approx'           //  ≈
    var globt51 = '!!&lt;='            //  ≤
    var globt52 = '!!&gt;='            //  ≥
    var globt53 = '!!plus-minus'       //  ±
    var globt54 = '!!cross-product'    //  ×
    var globt55 = '!!divide'           //  ÷
    var globt56 = '!!sqrt'             //  √
    var globt57 = '!!deg'              //  °
    var globt58 = '!!perpendicular'    //  ⊥
    var globt59 = '!!parallel'         //  ∥
    var globt60 = '!!congurent'        //  ≅
    var globt61 = '!!proportional'     //  ∝
    var globt62 = '!!infinity'         //  ∞
    var globt63 = '!!degree'           //  °
    var globt64 = '!!not-equal'        //  ≠
    var globt65 = '!!square'           //  ^2 , use !!p2 instead
    var globt66 = '!!cube'             //  ^3
    var globt67 = '!!euler'            //  _e_
    var globt68 = '!!left-arrow'       //  ←
    var globt69 = '!!right-arrow'      //  →
    var globt70 = '!!up-arrow'         //  ↑
    var globt71 = '!!down-arrow'       //  ↓
    var globt72 = '!!left-right-arrow' //  ↔
    var globt73 = '!!up-down-arrow'    //  ↕
    var globt74 = '!!long-left-arrow'  //  ⟵
    var globt75 = '!!long-right-arrow' //  ⟶
    var globt76 = '!!long-left-right-arrow' //  ⟷
    var globt77 = '!!implies'          //  ⇒
    var globt78 = '!!long-implies'     //  ⟹
    var globt79 = '!!minus-plus'       //  ∓
    var globt80 = '!!belongs-to'       //  ∈
    var globt81 = '!!not-belongs-to'   //  ∉
    var globt82 = '!!intersection'     //  ∩
    var globt83 = '!!union'            //  ∪
    var globt84 = '!!subset'           //  ⊆
    var globt85 = '!!proper-subset'    //  ⊂ 
    var globt86 = '!!not-subset'       //  ⊄ 
    var globt87 = '!!superset'         //  ⊇ 
    var globt88 = '!!not-superset'     //  ⊅ 
    var globt89 = '!!proper-superset'  //  ⊃
    var globt90 = '!!equivalence'      //  ≡ 
    var globt91 = '!!division'         //  ÷
    var globt92 = '!!equilibrium'      //  ⇌
    var globt93 = '!!sp!!'             //  &nbsp 
    var globt94 = '</divide>'
   
  
  
  
  for (ki = 0; ki < global_divs_all.length; ki++) {
      var global_divs = document.getElementsByTagName('eqn-space')[ki];
      var global_text = global_divs.innerHTML ;
  
  //!!vAB!! (vector)
  global_text = global_text.replace(/!!v(.)!!/g,'<vector>{$1}</vector>&nbsp')
  global_text = global_text.replace(/!!v(.)(.)!!/g,'<vector2>{$1$2}</vector2>&nbsp')
  
  
  //!!ci!! (vcap)
  global_text = global_text.replace(/!!c(.)!!/g,'<vcap>{$1}</vcap>&nbsp')
  global_text = global_text.replace(/!!c(.)(.)!!/g,'<vcap>{$1$2}</vcap>&nbsp')
  
  //!!nCr!! 
    global_text = global_text.replace(/!!(.)C(.)!!/g,'<sup>$1</sup>C<sub>$2</sub>')
    global_text = global_text.replace(/!!(.)(.)C(.)!!/g,'<sup>$1$2</sup>C<sub>$3</sub>')
    global_text = global_text.replace(/!!(.)(.)C(.)(.)!!/g,'<sup>$1$2</sup>C<sub>$3$4</sub>')
    global_text = global_text.replace(/!!(.)(.)(.)C(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5</sub>')
    global_text = global_text.replace(/!!(.)(.)(.)C(.)(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5$6</sub>')
  
  //!!nPr!! 
  global_text = global_text.replace(/!!(.)p(.)!!/g,'<sup>$1</sup>C<sub>$2</sub>')
  global_text = global_text.replace(/!!(.)(.)p(.)!!/g,'<sup>$1$2</sup>C<sub>$3</sub>')
  global_text = global_text.replace(/!!(.)(.)p(.)(.)!!/g,'<sup>$1$2</sup>C<sub>$3$4</sub>')
  global_text = global_text.replace(/!!(.)(.)(.)p(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5</sub>')
  global_text = global_text.replace(/!!(.)(.)(.)p(.)(.)(.)!!/g,'<sup>$1$2$3</sup>C<sub>$4$5$6</sub>')
  
  
  
  // !!Pn!! = ^n
    global_text = global_text.replace(/!!P(.)!!/g,'<sup>$1</sup>')
    global_text = global_text.replace(/!!P(.)(.)!!/g,'<sup>$1$2</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)!!/g,'<sup>$1$2$3</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7$8</sup>')
    global_text = global_text.replace(/!!P(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sup>$1$2$3$4$5$6$7$8$9</sup>')
  
  //!!_n!! = _n
    global_text = global_text.replace(/!!_(.)!!/g,'<sub>$1</sub>')
    global_text = global_text.replace(/!!_(.)(.)!!/g,'<sub>$1$2</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)!!/g,'<sub>$1$2$3</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7$8</sub>')
    global_text = global_text.replace(/!!_(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,'<sub>$1$2$3$4$5$6$7$8$9</sub>')
  
  
  //!!10pn!! = × 10^n
    global_text = global_text.replace(/!!10P(.)!!/g,' × 10<sup>$1</sup>')
    global_text = global_text.replace(/!!10P(.)(.)!!/g,' × 10<sup>$1$2</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)!!/g,' × 10<sup>$1$2$3</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7$8</sup>')
    global_text = global_text.replace(/!!10P(.)(.)(.)(.)(.)(.)(.)(.)(.)!!/g,' × 10<sup>$1$2$3$4$5$6$7$8$9</sup>')
  
  
  
  //globt
    global_text = global_text.replace(new RegExp(globt1, 'g') , 'α' );
    global_text = global_text.replace(new RegExp(globt2, 'g') , 'β' );
    global_text = global_text.replace(new RegExp(globt3, 'g') , 'γ' );
    global_text = global_text.replace(new RegExp(globt4, 'g') , 'Δ' );
    global_text = global_text.replace(new RegExp(globt5, 'g') , 'δ' );
    global_text = global_text.replace(new RegExp(globt6, 'g') , 'η' );
    global_text = global_text.replace(new RegExp(globt7, 'g') , 'θ' );
    global_text = global_text.replace(new RegExp(globt8, 'g') , 'λ' );
    global_text = global_text.replace(new RegExp(globt9, 'g') , 'λ' );
    global_text = global_text.replace(new RegExp(globt10, 'g') , 'π' );
    global_text = global_text.replace(new RegExp(globt11, 'g') , 'φ' ); 
    global_text = global_text.replace(new RegExp(globt12, 'g') , 'Φ' );
    global_text = global_text.replace(new RegExp(globt13, 'g') , 'Ψ' );
    global_text = global_text.replace(new RegExp(globt14, 'g') , 'ψ' );
    global_text = global_text.replace(new RegExp(globt15, 'g') , 'χ' );
    global_text = global_text.replace(new RegExp(globt16, 'g') , 'χ' );
    global_text = global_text.replace(new RegExp(globt17, 'g') , 'χ' );
    global_text = global_text.replace(new RegExp(globt18, 'g') , 'τ' );
    global_text = global_text.replace(new RegExp(globt19, 'g') , 'τ' );
    global_text = global_text.replace(new RegExp(globt20, 'g') , 'ω' );
    global_text = global_text.replace(new RegExp(globt21, 'g') , 'Ω' );
    global_text = global_text.replace(new RegExp(globt22, 'g') , 'Ω' );
    global_text = global_text.replace(new RegExp(globt23, 'g') , 'σ' );
    global_text = global_text.replace(new RegExp(globt24, 'g') , 'Σ' );
    global_text = global_text.replace(new RegExp(globt25, 'g') , 'Σ' );
    global_text = global_text.replace(new RegExp(globt26, 'g') , 'ρ' );
    global_text = global_text.replace(new RegExp(globt27, 'g') , 'ν' ); 
    global_text = global_text.replace(new RegExp(globt28, 'g') , 'μ' );
    global_text = global_text.replace(new RegExp(globt29, 'g') , 'υ' );
    global_text = global_text.replace(new RegExp(globt30, 'g') , 'υ' );
    global_text = global_text.replace(new RegExp(globt31, 'g') , 'ν' );
    global_text = global_text.replace(new RegExp(globt32, 'g') , 'ξ' );
    global_text = global_text.replace(new RegExp(globt33, 'g') , 'Π' );
    global_text = global_text.replace(new RegExp(globt34, 'g') , 'Π' );
    global_text = global_text.replace(new RegExp(globt35, 'g') , 'ζ' );
    global_text = global_text.replace(new RegExp(globt36, 'g') , 'ε' );
    global_text = global_text.replace(new RegExp(globt37, 'g') , 'ε' );
    global_text = global_text.replace(new RegExp(globt38, 'g') , 'κ' );
    global_text = global_text.replace(new RegExp(globt39, 'g') , 'κ' );
    global_text = global_text.replace(new RegExp(globt40, 'g') , '∫' );
    global_text = global_text.replace(new RegExp(globt41, 'g') , '∀' );
    global_text = global_text.replace(new RegExp(globt42, 'g') , '∃' );
    global_text = global_text.replace(new RegExp(globt43, 'g') , '∀' );
    global_text = global_text.replace(new RegExp(globt44, 'g') , '∃' );
    global_text = global_text.replace(new RegExp(globt45, 'g') , '∵' );
    global_text = global_text.replace(new RegExp(globt46, 'g') , '∴' );
    global_text = global_text.replace(new RegExp(globt47, 'g') , '⋅' );
    global_text = global_text.replace(new RegExp(globt48, 'g') , '≠' );
    global_text = global_text.replace(new RegExp(globt49, 'g') , '≠' );
    global_text = global_text.replace(new RegExp(globt50, 'g') , '≈' );
    global_text = global_text.replace(new RegExp(globt51, 'g') , '≤' );
    global_text = global_text.replace(new RegExp(globt52, 'g') , '≥' ); 
    global_text = global_text.replace(new RegExp(globt53, 'g') , '±' );
    global_text = global_text.replace(new RegExp(globt54, 'g') , '×' ); 
    global_text = global_text.replace(new RegExp(globt55, 'g') , '÷' );
    global_text = global_text.replace(new RegExp(globt56, 'g') , '√' );
    global_text = global_text.replace(new RegExp(globt57, 'g') , '°' );
    global_text = global_text.replace(new RegExp(globt58, 'g') , '⊥' );
    global_text = global_text.replace(new RegExp(globt59, 'g') , '∥' );
    global_text = global_text.replace(new RegExp(globt60, 'g') , '≅' );
    global_text = global_text.replace(new RegExp(globt61, 'g') , '∝' );
    global_text = global_text.replace(new RegExp(globt62, 'g') , '∞' );
    global_text = global_text.replace(new RegExp(globt63, 'g') , '°' );
    global_text = global_text.replace(new RegExp(globt64, 'g') , '≠' );
    global_text = global_text.replace(new RegExp(globt65, 'g') , '<sup>2</sup>' );
    global_text = global_text.replace(new RegExp(globt66, 'g') , '<sup>3</sup>' );
    global_text = global_text.replace(new RegExp(globt67, 'g') , '<i>e</i>' );
    global_text = global_text.replace(new RegExp(globt68, 'g') , '←' ); 
    global_text = global_text.replace(new RegExp(globt69, 'g') , '→' );
    global_text = global_text.replace(new RegExp(globt70, 'g') , '↑' );
    global_text = global_text.replace(new RegExp(globt71, 'g') , '↓' );
    global_text = global_text.replace(new RegExp(globt72, 'g') , '↔' );
    global_text = global_text.replace(new RegExp(globt73, 'g') , '↕' );
    global_text = global_text.replace(new RegExp(globt74, 'g') , '⟵' );
    global_text = global_text.replace(new RegExp(globt75, 'g') , '⟶' );
    global_text = global_text.replace(new RegExp(globt76, 'g') , '⟷' );
    global_text = global_text.replace(new RegExp(globt77, 'g') , '⇒' );
    global_text = global_text.replace(new RegExp(globt78, 'g') , '⟹' );
    global_text = global_text.replace(new RegExp(globt79, 'g') , '∓' );
  
    global_text = global_text.replace(/!!\u002B-/g , '±' );
    global_text = global_text.replace(/!!-\u002B/g , '∓' );
  
    global_text = global_text.replace(new RegExp(globt80, 'g') , '∈' );
    global_text = global_text.replace(new RegExp(globt81, 'g') , '∉' );
    global_text = global_text.replace(new RegExp(globt82, 'g') , '∩' );
    global_text = global_text.replace(new RegExp(globt83, 'g') , '∪' );
    global_text = global_text.replace(new RegExp(globt84, 'g') , '⊆' );
    global_text = global_text.replace(new RegExp(globt85, 'g') , '⊂' );
    global_text = global_text.replace(new RegExp(globt86, 'g') , '⊄' );
    global_text = global_text.replace(new RegExp(globt87, 'g') , '⊇' );
    global_text = global_text.replace(new RegExp(globt88, 'g') , '⊅' );
    global_text = global_text.replace(new RegExp(globt89, 'g') , '⊃' );
    global_text = global_text.replace(new RegExp(globt90, 'g') , '≡' );
    global_text = global_text.replace(new RegExp(globt91, 'g') , '÷' );
    global_text = global_text.replace(new RegExp(globt92, 'g') , '⇌' );
    global_text = global_text.replace(new RegExp(globt93, 'g') , '&nbsp' );
    global_text = global_text.replace(new RegExp(globt94, 'g') , '</divide> &nbsp;' );
    
  
  
  
    
  //differentiation 
    global_text = global_text.replace(/{!(.)\u002F(.)(.)}/g , '<divide>{$1}by[$2$3]</divide>&nbsp' );
    
  //limits
    global_text = global_text.replace(/{!lim_(.)-&gt;(.)}/g , '<limit>($1->$2)</limit>' );
    global_text = global_text.replace(/{!lim_(.)-&gt;(.)(.)}/g , '<limit>($1->$2$3)</limit>' );
    global_text = global_text.replace(/{!lim_(.)-&gt;(.)(.)(.)}/g , '<limit>($1->$2$3$4)</limit>' );
  
  
    global_divs.innerHTML = global_text}
  
  // <integ>(l)->[u]</integ>
    var yz;
    var integ_divs = document.getElementsByTagName('integ');
    for (yz = 0; yz < integ_divs.length; yz++) {
    integ_divs[yz].style.position = 'relative'
    var subsjsda = '-&gt;'
    var stro = document.getElementsByTagName('integ')[yz].innerHTML;
    var reso = stro.replace( /\u0028/g, ' &nbsp <sub style="position:relative;font-size:13px;top:4px;right:2px;">');
    reso = reso.replace( /\u0029/g, '</sub>');
    reso = reso.replace(new RegExp(subsjsda, 'g'), '');
    reso = reso.replace( /\u005B/g, '<sup style="position:absolute;font-size:13px;bottom:7px;right:7px;">');
    reso = reso.replace( /\u005D/g, '</sup>∫');
  
    integ_divs[yz].innerHTML = reso;
    }
    
  //limits : <limit>(x->0+)</limit>
    var ya;
    var lim_divs = document.getElementsByTagName('limit');
    for (ya = 0; ya < lim_divs.length; ya++) {
    lim_divs[ya].style.position = 'relative'
  
    var str0 = document.getElementsByTagName('limit')[ya].innerHTML;
    var res0 = str0.replace( /\u0028/g, 'lim<sub style="position:absolute;left:0%;top:55%;font-size:14px;">');
    res0 = res0.replace( /\u0029/g, '</sub> &nbsp');
  
    lim_divs[ya].innerHTML = res0;
  
    }
  
  setTimeout(function(){
  
  //division : <divide>(x)by[y]</divide>
  var yu;
  var divide_divs = document.getElementsByTagName('divide');
  for (yu = 0; yu < divide_divs.length; yu++) {
    divide_divs[yu].style.position = 'relative'
    divide_divs[yu].style.display = 'inline-block'
  
    var str2 = document.getElementsByTagName('divide')[yu].innerHTML;
    var res2 = str2.replace( /\u007B/g, '<sup class="divide-sup" style="position:relative;">');
    res2 = res2.replace( /\u007D/g, '</sup>');
    res2 = res2.replace( 'by', '<hr class="divide-hr" style="display:inline-block;position:absolute;top:41%;right:-5%;width:100%;height:0;border:0;border-top:1.5px solid black;">');
    res2 = res2.replace( /\u005B/g, '<sub style="display:block ruby;" class="divide-sub" >');
    res2 = res2.replace( /\u005D/g, '</sub>');
  
  
    divide_divs[yu].innerHTML = res2;
  }
  
  //divide part 2
  
  setTimeout( function(){
    var js
    for (js = 0; js < divide_divs.length; js++) {
    var divido_hr = document.getElementsByClassName('divide-hr')[js]
    var divido_sub = document.getElementsByClassName('divide-sub')[js]
    var divido_sub_width = divido_sub.offsetWidth
    var divido_sup = document.getElementsByClassName('divide-sup')[js]
    var divido_sup_width = divido_sup.offsetWidth
   
    if(divido_sub_width > divido_sup_width){ 
    divide_divs[js].style.width = `${divido_sub_width}px` ;
    divido_sub.style.position = 'absolute'
    divido_sub.style.top = '65%'
    divido_sub.style.left = '5%'
    divido_hr.style.top = '45%'
    divide_divs[js].style.textAlign = 'center'
  
  }
  else {
    divide_divs[js].style.textAlign = 'center'
    divido_sub.style.position = 'absolute'
    divido_sub.style.top = '60%'
    divido_sub.style.left = '45%'
  }
   }
  }, 200)
  },100)
  //Divide end
  
  //Matrice & determinants
  /*<determinant rows="3" columns="3">[!{Lois}{Griffin}{$150}][{Joe}{Swanson}{$300}][{Cleveland}{Brown}{$250}!]</determinant>
  { = \u007B
  } = \u007D
  [ = \u005B
  ] = \u005D*/
  
  var yd;
  var determinant_divs = document.getElementsByTagName('determinant');
  for (yd = 0; yd < determinant_divs.length; yd++) {
  determinant_divs[yd].style.display = "inline-flex"
  var str3 = document.getElementsByTagName('determinant')[yd].innerHTML;
  
  var res3 = str3.replace( /\u005B!\u007B/g, '<table class="det-table" style="position:relative;border-left:2px solid black;border-right:2px solid black;><tr class="det-tr"><td style="padding:0px 10px">');
  
  res3 = res3.replace( /\u007D\u007B/g, '</td><td style="padding:0px 10px">');
  res3 = res3.replace( /\u007D\u005D/g, '</td></tr>');
  res3 = res3.replace( /\u005B\u007B/g, '<tr><td style="padding:0px 10px">');
  res3 = res3.replace( /\u007D!\u005D/g, '</td></tr></table> &nbsp &nbsp ');
  
  determinant_divs[yd].innerHTML = res3;
  
  }
  
  // matrice 
  
  var ym1;
  var matrice_divs = document.getElementsByTagName('matrice');
  
  for (ym1 = 0; ym1 < matrice_divs.length; ym1++) {
  matrice_divs[ym1].style.display = "inline-flex"
  
  var str4 = document.getElementsByTagName('matrice')[ym1].innerHTML;
  
  var res4 = str4.replace( /\u005B!\u007B/g, '<div class="mat-div1"><div class="mat-div2"></div></div><table><tr><td class="mat-table" style="padding:0px 10px;position:relative;">');
  
  res4 = res4.replace( /\u007D\u007B/g, '</td><td style="padding:0px 10px;position:relative;">');
  res4 = res4.replace( /\u007D\u005D/g, '</td></tr>');
  res4 = res4.replace( /\u005B\u007B/g, '<tr><td style="padding:0px 10px;position:relative;">');
  res4 = res4.replace( /\u007D!\u005D/g, '</td></tr></div></table> &nbsp  &nbsp');
  
  matrice_divs[ym1].innerHTML = res4;
  
  }
  
  setTimeout(function(){
  var ym2;
  for (ym2 = 0; ym2 < matrice_divs.length; ym2++) {
  var mat_table = document.getElementsByClassName('mat-table')
  
  var mat_width = mat_table[ym2].offsetWidth*2.6
  var mat_height =  mat_table[ym2].offsetHeight*3.5
  
  //alert(`h=${mat_height};w=${mat_width}`)
  
  var mat_div1 = document.getElementsByClassName('mat-div1')[ym2]
  var mat_div2 = document.getElementsByClassName('mat-div2')[ym2]
  mat_div1.style.border = '2px solid black'
  mat_div1.style.position = 'absolute'
  mat_div1.style.height = `${mat_height}px`
  mat_div1.style.width = `${mat_width}px`
  
  
  mat_div2.style.position = 'absolute'
  
  mat_div2.style.mixBlendMode = 'normal'
  mat_div1.style.mixBlendMode = 'darken'
  
  mat_div2.style.height = `${mat_height+6}px`
  mat_div2.style.width = `${mat_width-25}px`
  mat_div2.style.left = '5%'
  mat_div2.style.bottom = '-3%'
  
  }
  },300)
  
  setTimeout( function(){
  //Vectors , <vector>{B}</vector>
  var vector_divs = document.getElementsByTagName('vector')
  for (i = 0; i < vector_divs.length; i++) {
  var vector_cur = vector_divs[i]
  
  
  vector_cur.style.position = 'relative'
  var str5 = document.getElementsByTagName('vector')[i].innerHTML;
  var res5 = str5.replace( /\u007B/g, '<hreg style="position:relative;left:5px;font-family:calibri;font-weight:600">');
  res5 = res5.replace( /\u007D/g, '</hreg><hreg style="position:absolute;bottom:40%;left:-40%;">⟶</hreg>');
  vector_cur.innerHTML = res5
  
  }},100)
  
  
  setTimeout( function(){
  //vector2s , <vector2>{B}</vector2>
  var vector2_divs = document.getElementsByTagName('vector2')
  for (i = 0; i < vector2_divs.length; i++) {
  var vector2_cur = vector2_divs[i]
  vector2_cur.style.position = 'relative'
  var str7 = document.getElementsByTagName('vector2')[i].innerHTML;
  var res7 = str7.replace( /\u007B/g, '<hreg style="position:relative;left:5px;font-family:calibri;font-weight:600">');
  res7 = res7.replace( /\u007D/g, '</hreg><hreg style="position:absolute;bottom:40%;left:10%;">⟶</hreg>');
  vector2_cur.innerHTML = res7
  }},100)
  
  setTimeout( function(){
  //Vcap , <vcap>{B}</vcap>
  var vcap_divs = document.getElementsByTagName('vcap')
  for (i = 0; i < vcap_divs.length; i++) {
  var vcap_cur = vcap_divs[i]
  
  vcap_cur.style.position = 'relative'
  var str6 = document.getElementsByTagName('vcap')[i].innerHTML;
  var res6 = str6.replace( /\u007B/g, '<hreg style="position:relative;left:4px;font-family:calibri;">');
  res6 = res6.replace( /\u007D/g, '</hreg><hreg style="font-size:15px;position:absolute;bottom:45%;left:50%;">^</hreg>');
  vcap_cur.innerHTML = res6
  }},100)
  
  //Chemistry <chem-eqn></chem-eqn>
  
   var chem_eqn_divs = document.getElementsByTagName('chem-eqn');
   var substr = '-&gt;';
   var substr2 = '--' ;
   var substr2b = '__' ;
  
   var substr3 = '_g' ;
   var substr4 = '_aq' ;
   var substr5 = '_s' ;
   var ik;
   for (ik = 0; ik < chem_eqn_divs.length; ik++) {
  // chem_eqn_divs[ik].style.backgroundColor = "grey"
  
   var str = document.getElementsByTagName('chem-eqn')[ik].innerHTML;
   var res = str.replace(new RegExp(substr2, 'g'), '<divide style="position:relative;bottom:3px;">{&nbsp &nbsp &nbsp &nbsp');
   res = res.replace(new RegExp(substr2b, 'g'), '&nbsp &nbsp &nbsp}by[');
   res = res.replace(new RegExp(substr, 'g'), ']</divide>&nbsp<fjosa style="font-size:18px;">></fjosa>');
   res = res.replace(/_(\d)/g,'<sub>$1</sub>')
   res = res.replace(new RegExp(substr3, 'g'), '<sub>(g)</sub>');
   res = res.replace(new RegExp(substr4, 'g'), '<sub>(aq)</sub>');
   res = res.replace(new RegExp(substr5, 'g'), '<sub>(s)</sub>');
   res = res.replace(/\u005E/g,'↑')
  
   chem_eqn_divs[ik].innerHTML = res;
   chem_eqn_divs[ik].style.fontFamily = "Calisto MT,serif"
  
   }
    
  }
  
  
  setTimeout( function() {eqn_start()} , 1000)
  
  /*
  <------------Personal Notes------------------>
  ( = \u0028
  ) = \u0029
  { = \u007B
  } = \u007D
  [ = \u005B
  ] = \u005D
  | = \u007C
  / = \u002F
  \ = \u005C
  + = \u002B
  
  */