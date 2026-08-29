
const btn1 = document.querySelector("#apkl")
const btn2 = document.querySelector("#load")
const lista = document.querySelector("#listaPaises")
const filter = document.querySelector("#filtroRegiao")
const input = document.querySelector("#campoBusca")
const est = document.querySelector("#estatisticas")
let key = ""
let dataToAdd;
let lastSearchDone = false;
let currentData;

const order = Object.freeze({NAME: 1, AREA: 2, POPULATION: 3})
const arrayNotEmpty = (a) => Array.isArray(a) && a.length > 0

function handleSearch(){
    const n = input.value
    if(n.trim() == "" && !lastSearchDone){
        console.log("nothing")
        return
    }
    console.log(n)
    console.log("Input changed!")
    if(!arrayNotEmpty(dataToAdd)){
        alert("Pesquise antes de filtrar!")
        return
    }
    const d = dataToAdd.filter(a => a.names.common.toLowerCase().startsWith(n))
    console.log(dataToAdd)
    console.log(d)
    addToList(true, d)
    lastSearchDone = true
}

function handleStatistics(o = []){
    est.innerHTML = ""
    if(!arrayNotEmpty(o)) return
    console.log("estatistics")
    console.log(o)
    const population = o.reduce((a, b) => a + b.population, 0)
    const area = o.reduce((a,b) => a + b.area.kilometers, 0) 
    const mpopu = population/o.length
    const marea = area/o.length
    const h1p = document.createElement("h1")
    h1p.innerText = `Soma da população: ${population}`
    const h1a = document.createElement("h1")
    h1a.innerText = `Soma da area: ${area}`
    const h1mp = document.createElement("h1")
    h1mp.innerText = `Media da população: ${mpopu}`
    const h1ma = document.createElement("h1")
    h1ma.innerText = `Media das areas: ${marea}`
    est.appendChild(h1p)
    est.appendChild(h1a)
    est.appendChild(h1mp)
    est.appendChild(h1ma)
}

function addToList(isSearch = false, data = []){
    let o;
    if(!isSearch) o = dataToAdd
    else{
         o = data
         lista.innerHTML = ""
    }
    if(!arrayNotEmpty(o)){
        console.log(o)
        lista.innerHTML = ""
        console.log("Não foi possivel adicionar!")
        return
    }
    currentData = o
     o.forEach(a =>{
            console.log(a)
            let capitals
            switch(a.capitals.length){
                case 0:
                    capitals = "Não há!"
                    break
                case 1:
                    capitals = a.capitals[0].name
                    break
                default:
                    capitals = a.capitals.reduce((b,it,ia) => b + (ia == 0 ? "" : ", ") + it.name, "")
            }
            console.log(capitals)
            const div = document.createElement("div")
            const img = document.createElement("img")
            img.src = a.flag.url_png
            img.alt = a.flag.description
            img.classList.add("handleClick")
            div.innerHTML = `<h1 class="handleClick name">Nome:${a.names.common}</h1> <h1 class="handleClick">Capital(is):${capitals}</h1>`
            div.appendChild(img)
            div.classList.add("pais")
            div.classList.add("handleClick")
            lista.appendChild(div)
        })
    handleStatistics(o)
}

async function CarregarTodos(o){
try{
  const response = [
  await fetch(`https://api.restcountries.com/countries/v5?limit=100`,
  { headers: { 'Authorization': `Bearer ${key}` } }),
  await fetch(`https://api.restcountries.com/countries/v5?limit=100&offset=100`,
  { headers: { 'Authorization': `Bearer ${key}` } }),
  await fetch(`https://api.restcountries.com/countries/v5?limit=100&offset=200`,
  { headers: { 'Authorization': `Bearer ${key}` } })]
  const respostas = await Promise.all(response)
  console.log(respostas)
  const dados = await Promise.all(respostas.map(res => res.json()))
  console.log(dados)
  lista.innerHTML = ""
  const d = []
  dados.forEach(a => a.data.objects.forEach(b => d.push(b)))
  if(o == order.POPULATION) d.sort((a,b) => a.population - b.population)
  if(o == order.AREA) d.sort((a,b) => a.area.kilometers - b.area.kilometers)
  if(o == order.NAME) d.sort((a,b) => a.names.common.localeCompare(b.names.common))
  console.log(d)
  dataToAdd = d 
  addToList()
  lastSearchDone = false
  handleSearch()
}catch(e) {console.error("Erro", e)}}

async function CarregarComRegiao(region, o){
    try{
    const response = await fetch(`https://api.restcountries.com/countries/v5?limit=100&region=${region}`, { headers: { 'Authorization': `Bearer ${key}` } })
    const data = await response.json();
    lista.innerHTML = ""
    if(o == order.POPULATION) data.data.objects.sort((a,b) => a.population - b.population)
    if(o == order.AREA) data.data.objects.sort((a,b) => a.area.kilometers - b.area.kilometers)
    if(o == order.NAME) data.data.objects.sort((a, b) => a.names.common.localeCompare(b.names.common))
    dataToAdd = data.data.objects
    addToList()
    console.log(region)
    lastSearchDone = false
    handleSearch()
    } catch(e){console.error("Erro:", e)}
}


function seeRegions(order, isSearch = false){
    const value = filter.value
    switch(value){
        case "Africa":
            CarregarComRegiao("Africa", order, isSearch)
            break
        case "Americas":
            CarregarComRegiao("America", order, isSearch)
            break
        case "Asia":
            CarregarComRegiao("Asia", order, isSearch)
            break
        case "Europe":
            CarregarComRegiao("Europe", order, isSearch)
            break
        case "Oceania":
            CarregarComRegiao("Ocenia", order, isSearch)
            break
        default: CarregarTodos(order, isSearch)
    }
}

const ordenarPorNome = ( ) => seeRegions(order.NAME)
const ordenarPorPopulacao = ( ) => seeRegions(order.POPULATION)
const ordenarPorArea = ( ) => seeRegions(order.AREA)

btn1.addEventListener("click", () => key = document.querySelector("#ak").value || "rc_live_dc3a7c949f5a4871b7ef30c97df2e226")
btn2.addEventListener("click", () => {if(key == "") alert("Defina uma key primeiro!"); else seeRegions()})
filter.addEventListener("change", () => {if(key == "") alert("Defina uma key primeiro!"); else seeRegions()})
input.addEventListener("input", handleSearch)
document.addEventListener("click", (e) =>{
    const className = e.target.className
    if(className.includes("handleClick")){
        console.log(e)
        console.log("has handleclick")
        let nameElement
        if(className.includes("name")){
            console.log("includes name!")
            nameElement = e.target
        }
        else{
            let shouldlookfor;
            if(e.target.localName == "div") shouldlookfor = e.target.childNodes
            else shouldlookfor = e.target.parentElement.childNodes
            console.log(shouldlookfor)
            const children = Array.from(shouldlookfor)
            console.log("children", children)
            nameElement = children.find(a => a.classList.contains("name"))
            if(typeof(nameElement) === undefined){
                console.log("Couldn't find the name!")
                return
            }
        }
        console.log("name element", nameElement)
        let name = nameElement.innerText.slice(5).toLowerCase()
        let hasReplaced = false;
        if(name.includes(" ")){ name = name.replaceAll(" ", "-")
            hasReplaced = true;
        }
        const divCountry = document.querySelector(`.${name}`)
        if(divCountry != null){
            if(divCountry.style.display == "none") divCountry.style.display = "block"
            else divCountry.style.display = "none"
        }
        else{
            if(!arrayNotEmpty(currentData)) return
            let nameToSearch;
            if(hasReplaced) nameToSearch = name.replaceAll("-", " ")
            else nameToSearch = name
            const country = currentData.find(a => a.names.common.toLowerCase() === nameToSearch)
            if(country === undefined){
            console.log("Couldn't find the country")
            return}
            const divToAdd = document.createElement("div")
            divToAdd.classList.add(`${name}`)
            divToAdd.classList.add("popout")
            divToAdd.style.display = "block"
            const h1m = document.createElement("h1")
            const h1idi = document.createElement("h1")
            const h1sr = document.createElement("h1")
            const h1f = document.createElement("h1")
            console.log(country)
            h1m.innerText = `Moedas: ${country.currencies.reduce((a, b, ia) => a + ((ia == 0)? "" : ", ")+ b.code, "") || "Não há!"}`
            h1idi.innerText = `Idiomas: ${country.languages.reduce((a, b, ia) => a + ((ia == 0)? "" : ", ") + b.name, "") || "Não há!"}`
            h1sr.innerText = `Sub-Regiao: ${country.subregion || "Não há!"}`
            h1f.innerText = `Fronteiras: ${country.borders.reduce((a, b, ia) => a + ((ia == 0)? "" : ", ") + b, "") || "Não há!"}`
            divToAdd.appendChild(h1m)
            divToAdd.appendChild(h1idi)
            divToAdd.appendChild(h1sr)
            divToAdd.appendChild(h1f)
            nameElement.parentElement.appendChild(divToAdd)
    }
        }
    })






