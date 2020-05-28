import React, { useState } from 'react';
import { MouseEvent } from 'react';
import './App.scss';
import moment from 'moment';
import ReactTooltip from 'react-tooltip'

const MAX_DURATION = 30*60;
const MIN_DURATION = 60;

const MAX_IDLE_INTERVAL = 30*60; // 30 min
const MIN_IDLE_INTERVA = 5*60; // 10 min
export enum CallLogType {
    OUTGOING_SUCCEEDED = 1,
    OUTGOING_NO_ANSWER = 2,
    INCOMING_RECEIVED = 3,
    // If modify this value, please update 20190214-add-call-conversation-update-trigger.js call_type value
    INCOMING_MISSED = 4,
    INCOMING_REJECT = 5
}

const TipUserId = 'The user id of this logged-in user';
const TipTableName = 'The sql table to generate these record';
const TipPhoneNumberStart = 'The phone number to start generating calls, every phone number will generate a call log';
const TipPhoneNumberEnd = 'The phone number to end generating calls, every phone number will generate a call log';
const TipDateStart = 'The date range to generate call logs, the interval between every two call logs is 5~30 minutes';
const TipDateEnd = 'The date range to generate call logs, the interval between every two call logs is 5~30 minutes';
function App() {
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.000 +00:00';
  const validDateFormat = 'YYYY-MM-DD HH:mm';
  const date = new Date();
  const tableName = 'call_conversations';
  // const accountId = '987';
  const [ accountId, setAccountId] = useState('987');
  const [ numberStart, setNumberStart] = useState('886277314001');
  const [ numberEnd, setNumberEnd] = useState('886277314100');
  const [ dateStart, setDateStart] = useState(moment(date).subtract(7, 'day').format(dateFormat));
  const [ dateEnd, setDateEnd] = useState(moment(date).subtract(1, 'day').format(dateFormat));
  const [ reset, setReset] = useState(false);

  const numberRecord = 100;
  const [ outputText, setOutputText] = useState('');
  const randomSec = (): number => {
	return MIN_IDLE_INTERVA + Math.random() * (MAX_IDLE_INTERVAL - MIN_IDLE_INTERVA);
  }
  const randomType = (): number => {
	return Math.floor(CallLogType.OUTGOING_SUCCEEDED + Math.random() * (CallLogType.INCOMING_REJECT - CallLogType.OUTGOING_SUCCEEDED));
  }
  const randomDuration = (): number => {
	return Math.floor(MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION));
  }
  const isValidPhoneNumber = (): boolean => {
	let _numberEnd = 0, _numberStart = 0;
	try {
		_numberEnd = parseInt(numberEnd);
		_numberStart = parseInt(numberStart);
	} catch (e) {
		return false;
	}
	if (_numberEnd <= _numberStart) {
		return false;
	}
	return true;
  }
  const isValidDate = (): boolean => {
	let _dateEnd = moment(), _dateStart = moment();
	try {
		_dateEnd = moment(dateEnd, validDateFormat);
		_dateStart = moment(dateStart, validDateFormat);
	} catch (e) {
		console.log('catch moment error', e);
		return false;
	}
	if (!_dateEnd.isValid() || !_dateStart.isValid()) {
		console.log('isValid _dateEnd moment', _dateEnd);
		console.log('isValid _dateStart moment', _dateStart);
		return false;
	}
	if (_dateEnd.isBefore(_dateStart)) {
		return false;
	}
	return true;
  }
  const generate = (event: MouseEvent<HTMLButtonElement>) => {
	  setOutputText('');
	  let _numberEnd = 0, _numberStart = 0;
	  try {
	  	_numberEnd = parseInt(numberEnd);
	  	_numberStart = parseInt(numberStart);
	  } catch (e) {}
	  if (_numberEnd <= _numberStart) {
		  return;
	  }
	  if (moment(dateEnd, validDateFormat).isAfter(date)) {
		return;
	  }
	  if (moment(dateStart, validDateFormat).isAfter(moment(dateEnd, validDateFormat))) {
		return;
	  }
	  let aDate = moment(dateEnd, validDateFormat);
	  aDate.hours(date.getHours());
	  aDate.minutes(date.getMinutes());
	  aDate.seconds(date.getSeconds());
	  let finalText = '';
	  for (let i = _numberStart ; i <= _numberEnd; i++) {
		  aDate = aDate.subtract(randomSec(), 's');
		  if (aDate.isBefore(dateStart)) {
			  break;
		  }
		  const type = randomType();
		  let duration = 0;
		  if (type === CallLogType.OUTGOING_SUCCEEDED || type === CallLogType.INCOMING_RECEIVED) {
			  duration = randomDuration();
		  }
		  const line = `INSERT INTO ${tableName}(phone_number, call_type, date, account_id, duration, createdAt, updatedAt)
		  VALUES ('${i}', ${type}, '${aDate.format(dateFormat)}', '${accountId}',  ${duration}, '${aDate.format(dateFormat)}', '${aDate.format(dateFormat)}');
`
		  finalText = line + finalText;
	  }
	  if (reset) {
		finalText = `DELETE FROM ${tableName} WHERE account_id='${accountId}';
` + finalText;
	  }
	  setOutputText(finalText);
  };
  return (
    <div className="App">
		<header className="App-header">
			SQL-GEN
		</header>
		<div className='inputForm'>
		{/* {moment(date).format('YYYY-MM-DD hh:mm:ss.000 +00:00')} */}
			<div className='inputRow'>
				<div className='inputTitle' data-tip={TipUserId} >Account User Id:</div>
				<input value={accountId} data-tip={TipUserId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setAccountId(e.target.value);
				}}/>
				<ReactTooltip place="bottom" type="warning" effect="solid"/>
			</div>
			<div className='inputHint'>
				<div className='hintText'></div>
			</div>

			<div className='inputRow'>
				<div className='inputTitle' data-tip={TipTableName}>Table name:</div>
				<input value={tableName} data-tip={TipTableName}/>
				<ReactTooltip place="bottom" type="warning" effect="solid"/>
			</div>
			<div className='inputHint'>
				<div className='hintText'></div>
			</div>

			<div className='inputRow'>
				<div className='inputTitle'>Phone number range:</div>
				<input value={numberStart} data-tip={TipPhoneNumberStart} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setNumberStart(e.target.value);
				}}/> -
				<input value={numberEnd} data-tip={TipPhoneNumberEnd} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setNumberEnd(e.target.value);
				}}/>
				<ReactTooltip place="bottom" type="warning" effect="solid"/>
			</div>
			<div className='inputHint'>
				{ isValidPhoneNumber() ? (<div className='hintText'>The smaller phone number will be on the top. i.e. The smaller phone number call log would be newer.</div>) :
					(<div className='warnText'>Something wrong with the phone number or range.</div>)}

			</div>

			<div className='inputRow'>
				<div className='inputTitle'>Date range:</div>
				<input className='dateInput' value={dateStart} data-tip={TipDateStart}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setDateStart(e.target.value);
					}}/> -
				<input className='dateInput' value={dateEnd} data-tip={TipDateEnd}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setDateEnd(e.target.value);
					}}/>
				<ReactTooltip place="bottom" type="warning" effect="solid"/>
			</div>
			<div className='inputHint'>
				{ isValidDate() ? (<div className='hintText'></div>) :
					(<div className='warnText'>Something wrong with the date or range.</div>)}

			</div>
			<div className='resetBox'>
				<input
					name="reset"
					type="checkbox"
					checked={reset}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setReset(e.target.checked);
					}}/>
				<div>Reset this account's call log</div>
			</div>
			{/* <div className='inputRow'>
				<div className='inputTitle'>Number of records:</div>
				<input value={numberRecord}/>
			</div> */}
			<button className='genButton' onClick={generate}>Generate</button>

		</div>
		<textarea className='outputText' value={outputText}></textarea>
    </div>
  );
}

export default App;
