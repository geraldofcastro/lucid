/*
* @adonisjs/lucid
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import test from 'japa'
import { Profiler } from '@adonisjs/profiler/build/standalone'

import { column } from '../../src/Orm/Decorators'
import { setup, cleanup, getDb, resetTables, getBaseModel, ormAdapter } from '../../test-helpers'

test.group('Model options | QueryBuilder', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('query builder set model options from the query client', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const users = await User.query().exec()
    assert.lengthOf(users, 1)

    assert.equal(users[0].$options!.connection, 'primary')
    assert.instanceOf(users[0].$options!.profiler, Profiler)
  })

  test('query builder set model options when only one row is fetched', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.query().first()

    assert.equal(user!.$options!.connection, 'primary')
    assert.instanceOf(user!.$options!.profiler, Profiler)
  })
})

test.group('Model options | Adapter', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('use correct client when custom connection is defined', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.query({ connection: 'secondary' }).first()
    assert.equal(user!.$options!.connection, 'secondary')
    assert.instanceOf(user!.$options!.profiler, Profiler)
  })

  test('pass profiler to the client when defined explicitly', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const user = await User.query({ profiler }).first()
    assert.equal(user!.$options!.connection, 'primary')
    assert.deepEqual(user!.$options!.profiler, profiler)
  })

  test('pass custom client to query builder', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const client = db.connection()

    const user = await User.query({ client }).first()
    assert.equal(user!.$options!.connection, 'primary')
  })

  test('pass transaction client to query builder', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const trx = await db.connection('secondary').transaction()
    const user = await User.query({ client: trx }).first()
    await trx.rollback()

    assert.equal(user!.$options!.connection, 'secondary')
  })
})

test.group('Model options | Model.find', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('define custom connection', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.find(1, { connection: 'secondary' })
    assert.equal(user!.$options!.connection, 'secondary')
    assert.instanceOf(user!.$options!.profiler, Profiler)
  })

  test('define custom profiler', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const user = await User.find(1, { profiler })
    assert.deepEqual(user!.$options!.profiler, profiler)
  })

  test('define custom query client', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const client = db.connection()

    const user = await User.find(1, { client })
    assert.deepEqual(user!.$options!.profiler, client.profiler)
    assert.deepEqual(user!.$options!.connection, client.connectionName)
  })
})

test.group('Model options | Model.findOrFail', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('define custom connection', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.findOrFail(1, { connection: 'secondary' })
    assert.equal(user.$options!.connection, 'secondary')
    assert.instanceOf(user.$options!.profiler, Profiler)
  })

  test('define custom profiler', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const user = await User.findOrFail(1, { profiler })
    assert.deepEqual(user.$options!.profiler, profiler)
  })

  test('define custom query client', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const client = db.connection('secondary')

    const user = await User.findOrFail(1, { client })
    assert.deepEqual(user.$options!.profiler, client.profiler)
    assert.deepEqual(user.$options!.connection, client.connectionName)
  })
})

test.group('Model options | Model.findMany', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('define custom connection', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const users = await User.findMany([1], { connection: 'secondary' })
    assert.equal(users[0].$options!.connection, 'secondary')
    assert.instanceOf(users[0].$options!.profiler, Profiler)
  })

  test('define custom profiler', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const users = await User.findMany([1], { profiler })
    assert.deepEqual(users[0].$options!.profiler, profiler)
  })

  test('define custom query client', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const client = db.connection('secondary')

    const users = await User.findMany([1], { client })
    assert.deepEqual(users[0].$options!.profiler, client.profiler)
    assert.deepEqual(users[0].$options!.connection, client.connectionName)
  })
})

test.group('Model options | Model.firstOrSave', (group) => {
  group.before(async () => {
    await setup()
  })

  group.after(async () => {
    await cleanup()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('define custom connection', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.firstOrSave({ username: 'virk' }, undefined, { connection: 'secondary' })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 1)
    assert.equal(user.$options!.connection, 'secondary')
    assert.instanceOf(user.$options!.profiler, Profiler)
  })

  test('define custom connection when search fails', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })

    const user = await User.firstOrSave({ username: 'nikk' }, undefined, { connection: 'secondary' })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 2)
    assert.equal(user.$options!.connection, 'secondary')
    assert.instanceOf(user.$options!.profiler, Profiler)
  })

  test('define custom profiler', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const user = await User.firstOrSave({ username: 'virk' }, undefined, { profiler })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 1)
    assert.equal(user.$options!.connection, 'primary')
    assert.deepEqual(user.$options!.profiler, profiler)
  })

  test('define custom profiler when search fails', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const profiler = new Profiler({})

    const user = await User.firstOrSave({ username: 'nikk' }, undefined, { profiler })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 2)
    assert.deepEqual(user.$options!.profiler, profiler)
  })

  test('define custom client', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const client = db.connection('secondary')

    const user = await User.firstOrSave({ username: 'virk' }, undefined, { client })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 1)
    assert.deepEqual(user.$options!.profiler, client.profiler)
    assert.deepEqual(user.$options!.connection, client.connectionName)
  })

  test('define custom client when search fails', async (assert) => {
    const BaseModel = getBaseModel(ormAdapter())

    class User extends BaseModel {
      public static $table = 'users'

      @column({ primary: true })
      public id: number

      @column()
      public username: string
    }

    const db = getDb()
    await db.insertQuery().table('users').insert({ username: 'virk' })
    const client = db.connection('secondary')

    const user = await User.firstOrSave({ username: 'nikk' }, undefined, { client })
    const total = await db.from('users').count('*', 'total')

    assert.equal(total[0].total, 2)
    assert.deepEqual(user.$options!.profiler, client.profiler)
    assert.deepEqual(user.$options!.connection, client.connectionName)
  })
})