# mosopen-parser

все шаги запускаются последовательно, с помощью   
`npm run all` можно запустить сразу все. предварительно   
надо запустить хром с режимом cdp и в `src/geocoder/{type}.ts`   
занести урл в CDP_URL константу

для начала необходимо установить пакеты
```bash
npm i
```

сбор всех адресов происходит в `src/index.ts`    
он записывает адреса в **result.json**
```bash
npm run parse
```

агрегация адресов происходит в `src/aggregate.ts`    
он берет адреса из **result.json** и кладет в **result_aggregated.json**
```bash
npm run aggregate
```

геокодирование происходит в `src/geocoder`. на данный    
момент поддерживаются два геокодера, `dadata` и `geoconcept`.   
сырые адреса берутся из **result_aggregated.json** и уже обработанные    
(с координатами) помещаются в **result_addresses.json**
```bash
npm run geocode:geoconcept
```
или
```bash
npm run geocode:dadata
```
