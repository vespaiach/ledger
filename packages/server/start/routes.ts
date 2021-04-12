/**
 * Ledger API Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen
 */

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('transactions', 'TransactionsController.get')
  Route.post('transactions', 'TransactionsController.create')
  Route.put('transactions', 'TransactionsController.update')
  Route.get('transactions/years', 'TransactionsController.years')
  Route.delete('transactions/:id', 'TransactionsController.delete')
})
  .prefix('api')
  .where('id', /^[0-9]+$/)

Route.get('/*', async ({ view }) => {
  return view.render('home')
})
