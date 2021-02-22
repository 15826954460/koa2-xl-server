/**
 * @author 柏运送
 * @date 2021-02-22 22:07:03
 * @description user server
*/

const seq = require('../seq');
const { Users } = require('../module/index');
const { SuccessModule, ErrorModule } = require('../../response/response');
const { paramsError, sqlError, serverError, userHasExits } = require('../../response/error-info');

// 创建用户
async function create(body) {
  const { username, password, ...params } = body;
  if (!username || !password) return new ErrorModule(paramsError);
  return seq.transaction(async (t) => {
    // 判断用户是否存在
    const res = await Users.findOne({
      where: { username }
    }, { transaction: t });
    if (res) return new ErrorModule(userHasExits);

    // 创建用户
    await Users.create({ username, password, ...params }, {
      transaction: t
    });
    return new SuccessModule();
  }).catch(err => {
    console.log('-------------create', err);
    return new ErrorModule(sqlError);
  });
}

// 查询用户
async function query(params = {}) {
  let where = {};
  const { limit, offset = 0, ...options } = params;
  if (JSON.stringify(options) !== '{}') {
    for (let [key, val] of Object.entries(options)) {
      where[key] = val;
    };
  }
  return seq.transaction(async t => {
    const res = await Users.findAndCountAll({
      attributes: ['id', 'username', 'nick_name', 'gender', 'picture', 'city', 'email'], // 查询属性
      where, // 查询条件
      limit,
      offset,
      order: [
        ['create_time', 'desc'], // 创建时间倒序
        ['id', 'asc'], // id 升序
      ], // 排序
    }, {
        transaction: t
      });
    const { count, rows } = res;
    const result = rows.map((item) => {
      return { count, ...item.dataValues }
    });
    console.log('------------', result);
    return new SuccessModule(result);
  }).catch(err => {
    console.log('-------------create', err);
    return new ErrorModule(sqlError);
  });
}

module.exports = {
  create, query
}