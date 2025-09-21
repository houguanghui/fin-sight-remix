import { http, graphql, HttpResponse } from 'msw'
import { balanceSheetMock } from './fundamental/balanceSheetMock'
import { profitMock } from './fundamental/profitMock'
import { cashFlowMock } from './fundamental/cashFlowMock'
import { companyMock } from './fundamental/companyMock'
import { stockMinuteMock } from './stock/stockMinuteMock'
import { stockDailyMock } from './stock/stockDailyMock'
import { stockMonthlyMock } from './stock/stockMonthlyMock'
import { statsAnalysisMock } from './macro-economic/statsAnalysisMock'

export const handlers = [
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
  graphql.query('ListMovies', () => {
    return HttpResponse.json({
      data: {
        movies: [
          {
            id: '6c6dba95-e027-4fe2-acab-e8c155a7f0ff',
            title: 'The Lord of The Rings',
          },
          {
            id: 'a2ae7712-75a7-47bb-82a9-8ed668e00fe3',
            title: 'The Matrix',
          },
          {
            id: '916fa462-3903-4656-9e76-3f182b37c56f',
            title: 'Star Wars: The Empire Strikes Back',
          },
        ],
      },
    })
  }),
].concat(balanceSheetMock).concat(profitMock).concat(cashFlowMock).concat(companyMock)
.concat(stockMinuteMock).concat(stockDailyMock).concat(stockMonthlyMock)
.concat(statsAnalysisMock)