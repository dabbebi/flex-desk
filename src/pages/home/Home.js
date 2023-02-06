import './Home.css';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { getIdentity } from '../../services/authentication/auth.service';
import { bookNewPlace, freePlace, getOfficeStatus } from '../../services/booking/booking.service';
import { Dialog } from 'primereact/dialog';

function Home() {

  const [useEffectDep, __] = useState(false);
  const [myPublicId, setMyPublicId] = useState('');
  const [floor, setFloor] = useState('4th floor');
  const [floors, setFloors] = useState([/*'1st floor', '2nd floor', '3rd floor', */'4th floor'/*, '5th floor', '6th floor', '7th floor'*/ ]);
  const [team, setTeam] = useState('Mfact');
  const [teams, setTeams] = useState([ 'Mfact', 'Optima', 'Icon']);
  const [date, setDate] = useState(new Date());
  const [username, setUsername] = useState('');
  const [officeStatus, setOfficeStatus] = useState([]);
  const [viewOwnerDialog, setViewOwnerDialog] = useState(false);
  const [confirmBookingDialog, setConfirmBookingDialog] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [currentPlace, setCurrentPlace] = useState('');

  function isBooked(place) {
    for(var i = 0; i< officeStatus.length; i++) {
      if(officeStatus[i].place === place){
        return true;
      }
    }
    return false;
  }

  function canBook() {
    for(var i = 0; i< officeStatus.length; i++) {
      if(officeStatus[i].user_id === myPublicId){
        return false;
      }
    }
    return true;
  }

  function isMyPlace() {
    for(var i = 0; i< officeStatus.length; i++) {
      if(officeStatus[i].place === currentPlace){
        if(officeStatus[i].user_id === myPublicId) {
          return true;
        }
        return false;
      }
    }
    return false;
  }

  function getBookerName() {
    for(var i = 0; i< officeStatus.length; i++) {
      if(officeStatus[i].place === currentPlace){
        return officeStatus[i].firstname + ' ' + officeStatus[i].lastname;
      }
    }
    return '';
  }

  function getBookerAbrName(place) {
    for(var i = 0; i< officeStatus.length; i++) {
      if(officeStatus[i].place === place){
        return officeStatus[i].firstname[0] + officeStatus[i].lastname[0] + officeStatus[i].lastname[1].toUpperCase();
      }
    }
    return '';
  }

  function onFloorChangeChange(e) {
    setFloor(e.target.value);
  }

  function onTeamChangeChange(e) {
    setTeam(e.target.value);
  }

  async function initUsername() {
    try {
      const response = await getIdentity();
      setUsername(response.data.firstname + ' ' + response.data.lastname);
      setMyPublicId(response.data.public_id);
    } catch (error) {
      console.log(error.response.data);
    }
  }

  function hideConfirmBookingDialog() {
    setConfirmBookingDialog(false);
  }

  function hideViewOwnerDialog() {
    setViewOwnerDialog(false);
  }

  function hideLoadingDialog() {
    setLoadingDialog(false);
  }

  async function bookPlace() {
    if(canBook()) {
      try {
        const db_date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
        const data = {
          floor: floor,
          date: db_date,
          place: currentPlace,
          team: team
        };
        const response = await bookNewPlace(data);
        setOfficeStatus(response.data);
      } catch (error) {
        console.log(error.response.data);
      }
      setConfirmBookingDialog(false);
    }
  }

  async function unbookPlace() {
    if(isMyPlace()) {
      try {
        const db_date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
        const data = {
          floor: floor,
          date: db_date,
          place: currentPlace
        };
        const response = await freePlace(data);
        setOfficeStatus(response.data);
      } catch (error) {
        console.log(error.response.data);
      }
      setViewOwnerDialog(false);
    }
  }

  function viewPlaceOwner(place) {
    setCurrentPlace(place);
    setViewOwnerDialog(true);
  }

  async function getFloorStatus() {
    try {
      const db_date = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
      const data = {
        floor: floor,
        date: db_date
      };
      const response = await getOfficeStatus(data);
      setOfficeStatus(response.data);
    } catch (error) {
      console.log(error.rersponse.data);
    }
  }

  function confirmBookPlace(place) {
    setCurrentPlace(place);
    setConfirmBookingDialog(true);
  }

  async function changeDate(e) {
    setLoadingDialog(true);
    setDate(e.value);
    const theDate = e.value
    const db_date = theDate.getDate() + '/' + theDate.getMonth() + '/' + theDate.getFullYear();
    try {
      const data = {
        floor: floor,
        date: db_date,
        team: team
      };
      const response = await getOfficeStatus(data);
      if(response) {
        setOfficeStatus(response.data);
        hideLoadingDialog();
      }
    } catch (error) {
      console.log(error.rersponse.data);
    }
  }

  useEffect(() => {
    initUsername();
    getFloorStatus();
  }, [useEffectDep]);

  const viewOwnerDialogFooter = (
    <React.Fragment>
        { isMyPlace() && <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideViewOwnerDialog} />}
        { isMyPlace() && <Button label="Free" icon="pi pi-check" className="p-button-text" onClick={unbookPlace} />}
        { !isMyPlace() && <Button label="OK" icon="pi pi-check" className="p-button-text" onClick={hideViewOwnerDialog} />}
    </React.Fragment>
  );

  const confirmBookingDialogFooter = (
    <React.Fragment>
        { canBook() && <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideConfirmBookingDialog} />}
        { canBook() && <Button label="Confirm" icon="pi pi-check" className="p-button-text" onClick={bookPlace}/>}
        { !canBook() && <Button label="OK" icon="pi pi-check" className="p-button-text" onClick={hideConfirmBookingDialog}/>}
    </React.Fragment>
  );

  return (
    <div className="home">
      <div className="side-bar">
        <div className="floor-number">
          
          <div className="label">
            Employee :
          </div>
          <div className="drop-input identity">
          <div>
          <Button icon="pi pi-user" className="p-button-default p-button-outlined mr-2 p-button-rounded" onClick={null} style={{width: '28px', height: '28px'}}/>
          </div>
          <div className='username'>
            {username}
          </div>
          </div>
          
        </div>
        <div className="floor-number">
          <div className="label">
            Floor :
          </div>
          <div className='drop-input'>
            <Dropdown value={floor}
              options={floors}
              onChange={onFloorChangeChange}
              placeholder="Select a Floor"
              style={{ width: '100%' }} />
          </div>
        </div>
        <div className="floor-number">
          <div className="label">
            Team :
          </div>
          <div className='drop-input'>
            <Dropdown value={team}
              options={teams}
              onChange={onTeamChangeChange}
              placeholder="Select a Team"
              style={{ width: '100%' }} />
          </div>
        </div>
        <div className="date">
          <Calendar value={date}
            onChange={(e) => changeDate(e)}
            style={{ width: '100%' }} 
            inline/>
        </div>
        <div className="key">
          <div className="one-key">
            <div className="available column chair"></div>
            <div className="meaning">
              Available place.
            </div>
          </div>
          <div className="one-key">
            <div className="booked column chair"></div>
            <div className="meaning">
              Booked place.
            </div>
          </div>
          <div className="one-key">
            <div className="not-in column chair"></div>
            <div className="meaning">
              Place owned by an other team.
            </div>
          </div>
          <div className="one-key">
            <div className="available-co column chair"></div>
            <div className="meaning">
              Place available in the co-working space.
            </div>
          </div>
          <div className="one-key">
            <div className="booked-co column chair"></div>
            <div className="meaning">
              Place booked in the co-working space.
            </div>
          </div>
        </div>        
      </div>
      <div className="main-content">
        {/**** 1 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column top left"></div>
          <div className="column top">Manager</div>
          <div className="column top"></div>
          <div className="column top"></div>
          <div className="column top"></div>
          <div className="column top"></div>
          <div className="column top"></div>
          <div className="column top right"></div>
        </div>
        {/**** 2 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom">Office</div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column right bottom"></div>
        </div>
        {/**** 3 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column right bottom table"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 4 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column chair bottom">
            { team === 'Mfact' && !isBooked('MF02') && <div className="available column chair" onClick={() => confirmBookPlace('MF02')}></div> }
            { team === 'Mfact' && isBooked('MF02') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF02')}>
            <div className="booker-name">{getBookerAbrName('MF02')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column chair bottom">
            { team === 'Mfact' && !isBooked('MF01') && <div className="available column chair" onClick={() => confirmBookPlace('MF01')}></div> }
            { team === 'Mfact' && isBooked('MF01') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF01')}>
            <div className="booker-name">{getBookerAbrName('MF01')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right bottom"></div>
        </div>
        {/**** 5 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column right table"></div>
        </div>
        {/**** 6 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table bottom left"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column right table bottom"></div>
        </div>
        {/**** 7 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF03') && <div className="available column chair" onClick={() => confirmBookPlace('MF03')}></div> }
            { team === 'Mfact' && isBooked('MF03') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF03')}>
            <div className="booker-name">{getBookerAbrName('MF03')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF04') && <div className="available column chair" onClick={() => confirmBookPlace('MF04')}></div> }
            { team === 'Mfact' && isBooked('MF04') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF04')}>
            <div className="booker-name">{getBookerAbrName('MF04')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF05') && <div className="available column chair" onClick={() => confirmBookPlace('MF05')}></div> }
            { team === 'Mfact' && isBooked('MF05') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF05')}>
            <div className="booker-name">{getBookerAbrName('MF05')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF06') && <div className="available column chair" onClick={() => confirmBookPlace('MF06')}></div> }
            { team === 'Mfact' && isBooked('MF06') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF06')}>
            <div className="booker-name">{getBookerAbrName('MF06')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 8 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column top left table"></div>
          <div className="column top table"></div>
          <div className="column top table"></div>
          <div className="column top table"></div>
          <div className="column top table"></div>
          <div className="column right top table"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 9 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column left bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 10 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF07') && <div className="available column chair" onClick={() => confirmBookPlace('MF07')}></div> }
            { team === 'Mfact' && isBooked('MF07') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF07')}>
            <div className="booker-name">{getBookerAbrName('MF07')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF08') && <div className="available column chair" onClick={() => confirmBookPlace('MF08')}></div> }
            { team === 'Mfact' && isBooked('MF08') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF08')}>
              <div className="booker-name">{getBookerAbrName('MF08')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Icon' && !isBooked('ICO01') && <div className="available column chair" onClick={() => confirmBookPlace('ICO01')}></div> }
            { team === 'Icon' && isBooked('ICO01') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO01')}>
            <div className="booker-name">{getBookerAbrName('ICO01')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Icon' && !isBooked('ICO02') && <div className="available column chair" onClick={() => confirmBookPlace('ICO02')}></div> }
            { team === 'Icon' && isBooked('ICO02') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO02')}>
            <div className="booker-name">{getBookerAbrName('ICO02')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right bottom"></div>
        </div>
        {/**** 11 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column right table"></div>
        </div>
        {/**** 12 ****/}
        <div className="line">
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF09') && <div className="available column chair" onClick={() => confirmBookPlace('MF09')}></div> }
            { team === 'Mfact' && isBooked('MF09') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF09')}>
            <div className="booker-name">{getBookerAbrName('MF09')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table bottom left"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column right table bottom"></div>
        </div>
        {/**** 13 ****/}
        <div className="line">
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table top left"></div>
          <div className="column table top"></div>
          <div className="column table top right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right bottom"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Icon' && !isBooked('ICO03') && <div className="available column chair" onClick={() => confirmBookPlace('ICO03')}></div> }
            { team === 'Icon' && isBooked('ICO03') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO03')}>
            <div className="booker-name">{getBookerAbrName('ICO03')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Icon' && !isBooked('ICO04') && <div className="available column chair" onClick={() => confirmBookPlace('ICO04')}></div> }
            { team === 'Icon' && isBooked('ICO04') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO04')}>
            <div className="booker-name">{getBookerAbrName('ICO04')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 14 ****/}
        <div className="line">
          <div className="column left"></div>
          <div className="column chair">
            <div className="not-in column chair" onClick={null}></div>
          </div>
          <div className="column table left"></div>
          <div className="column table right"></div>
          <div className="column chair">
            <div className="not-in column chair" onClick={null}></div>
          </div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF10') && <div className="available column chair" onClick={() => confirmBookPlace('MF10')}></div> }
            { team === 'Mfact' && isBooked('MF10') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF10')}>
            <div className="booker-name">{getBookerAbrName('MF10')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF11') && <div className="available column chair" onClick={() => confirmBookPlace('MF11')}></div> }
            { team === 'Mfact' && isBooked('MF11') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF11')}>
            <div className="booker-name">{getBookerAbrName('MF11')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column top left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 15 ****/}
        <div className="line">
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table left bottom"></div>
          <div className="column table bottom right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>          
          <div className="column table left bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column left table right top bottom"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 16 ****/}
        <div className="line">
          <div className="column left bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Mfact' && !isBooked('MF12') && <div className="available column chair" onClick={() => confirmBookPlace('MF12')}></div> }
            { team === 'Mfact' && isBooked('MF12') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF12')}>
            <div className="booker-name">{getBookerAbrName('MF12')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column bottom left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Icon' && !isBooked('ICO05') && <div className="available column chair" onClick={() => confirmBookPlace('ICO05')}></div> }
            { team === 'Icon' && isBooked('ICO05') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO05')}>
            <div className="booker-name">{getBookerAbrName('ICO05')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Icon' && !isBooked('ICO06') && <div className="available column chair" onClick={() => confirmBookPlace('ICO06')}></div> }
            { team === 'Icon' && isBooked('ICO06') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO06')}>
            <div className="booker-name">{getBookerAbrName('ICO06')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right bottom"></div>
        </div>
        {/**** 17 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right top"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column right table"></div>
        </div>
        {/**** 18 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Mfact' && !isBooked('MF13') && <div className="available column chair" onClick={() => confirmBookPlace('MF13')}></div> }
            { team === 'Mfact' && isBooked('MF13') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF13')}>
            <div className="booker-name">{getBookerAbrName('MF13')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom chair">
            { team === 'Mfact' && !isBooked('MF14') && <div className="available column chair" onClick={() => confirmBookPlace('MF14')}></div> }
            { team === 'Mfact' && isBooked('MF14') && <div className="booked column chair" onClick={() => viewPlaceOwner('MF14')}>
            <div className="booker-name">{getBookerAbrName('MF14')}</div>
            </div> }
            { team !== 'Mfact' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column bottom"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column bottom table left"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table"></div>
          <div className="column right bottom table"></div>
        </div>
        {/**** 19 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Icon' && !isBooked('ICO07') && <div className="available column chair" onClick={() => confirmBookPlace('ICO07')}></div> }
            { team === 'Icon' && isBooked('ICO07') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO07')}>
            <div className="booker-name">{getBookerAbrName('ICO07')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Icon' && !isBooked('ICO08') && <div className="available column chair" onClick={() => confirmBookPlace('ICO08')}></div> }
            { team === 'Icon' && isBooked('ICO08') && <div className="booked column chair" onClick={() => viewPlaceOwner('ICO08')}>
            <div className="booker-name">{getBookerAbrName('ICO08')}</div>
            </div> }
            { team !== 'Icon' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 20 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column table left bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom"></div>
          <div className="column table bottom right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 21 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP01') && <div className="available column chair" onClick={() => confirmBookPlace('OP01')}></div> }
            { team === 'Optima' && isBooked('OP01') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP01')}>
            <div className="booker-name">{getBookerAbrName('OP01')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP02') && <div className="available column chair" onClick={() => confirmBookPlace('OP02')}></div> }
            { team === 'Optima' && isBooked('OP02') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP02')}>
            <div className="booker-name">{getBookerAbrName('OP02')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 22 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP03') && <div className="available column chair" onClick={() => confirmBookPlace('OP03')}></div> }
            { team === 'Optima' && isBooked('OP03') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP03')}>
            <div className="booker-name">{getBookerAbrName('OP03')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 23 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table top left"></div>
          <div className="column table top"></div>
          <div className="column table top right"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 24 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column left bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP04') && <div className="available column chair" onClick={() => confirmBookPlace('OP04')}></div> }
            { team === 'Optima' && isBooked('OP04') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP04')}>
            <div className="booker-name">{getBookerAbrName('OP04')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP05') && <div className="available column chair" onClick={() => confirmBookPlace('OP05')}></div> }
            { team === 'Optima' && isBooked('OP05') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP05')}>
            <div className="booker-name">{getBookerAbrName('OP05')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 25 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column entrance left top bottom"></div>
          <div className="column entrance top bottom"></div>
          <div className="column entrance top bottom"></div>
          <div className="column entrance top bottom"></div>
          <div className="column entrance top bottom right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table bottom left"></div>
          <div className="column table bottom"></div>
          <div className="column table right bottom"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 26 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { team === 'Optima' && !isBooked('OP06') && <div className="available column chair" onClick={() => confirmBookPlace('OP06')}></div> }
            { team === 'Optima' && isBooked('OP06') && <div className="booked column chair" onClick={() => viewPlaceOwner('OP06')}>
            <div className="booker-name">{getBookerAbrName('OP06')}</div>
            </div> }
            { team !== 'Optima' && <div className="not-in column chair" onClick={null}></div> }
          </div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 27 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 28 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table top left"></div>
          <div className="column table top"></div>
          <div className="column table top right"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 29 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { !isBooked('CO01') && <div className="available-co column chair" onClick={() => confirmBookPlace('CO01')}></div> }
            { isBooked('CO01') && <div className="booked-co column chair" onClick={() => viewPlaceOwner('CO01')}>
            <div className="booker-name">{getBookerAbrName('CO01')}</div>
            </div> }
          </div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column chair">
            { !isBooked('CO02') && <div className="available-co column chair" onClick={() => confirmBookPlace('CO02')}></div> }
            { isBooked('CO02') && <div className="booked-co column chair" onClick={() => viewPlaceOwner('CO02')}>
            <div className="booker-name">{getBookerAbrName('CO02')}</div>
            </div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 30 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column"></div>
          <div className="column right"></div>
        </div>
        {/**** 31 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column chair">
            { !isBooked('CO03') && <div className="available-co column chair" onClick={() => confirmBookPlace('CO03')}></div> }
            { isBooked('CO03') && <div className="booked-co column chair" onClick={() => viewPlaceOwner('CO03')}>
            <div className="booker-name">{getBookerAbrName('CO03')}</div>
            </div> }
          </div>
          <div className="column table left"></div>
          <div className="column table"></div>
          <div className="column table right"></div>
          <div className="column chair">
            { !isBooked('CO04') && <div className="available-co column chair" onClick={() => confirmBookPlace('CO04')}></div> }
            { isBooked('CO04') && <div className="booked-co column chair" onClick={() => viewPlaceOwner('CO04')}>
            <div className="booker-name">{getBookerAbrName('CO04')}</div>
            </div> }
          </div>
          <div className="column right"></div>
        </div>
        {/**** 32 ****/}
        <div className="line">
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column"></div>
          <div className="column right"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom"></div>
          <div className="column bottom table left"></div>
          <div className="column bottom table"></div>
          <div className="column bottom table right"></div>
          <div className="column bottom"></div>
          <div className="column right bottom"></div>
        </div>
      </div>
        <Dialog visible={confirmBookingDialog} style={{ width: '500px', backgroundColor: 'white'  }} header={"Place " + currentPlace} modal footer={confirmBookingDialogFooter} onHide={hideConfirmBookingDialog}>
          <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '20px'}} />
              {canBook() && <span>Are you sure you want to book the place {currentPlace}?</span>}
              {!canBook() && <span>Sorry! you can't book two places in the same day.</span>}
          </div>
        </Dialog>

        <Dialog visible={viewOwnerDialog} style={{ width: '500px', backgroundColor: 'white'  }} header={"Place " + currentPlace} modal footer={viewOwnerDialogFooter} onHide={hideViewOwnerDialog}>
          <div className="confirmation-content">
            <span>The place {currentPlace} is booked by {getBookerName()}</span>
          </div>
        </Dialog>

        <Dialog visible={loadingDialog} modal closable={false} showHeader={false}>
          <div id='spinner-loading'>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', backgroundColor: 'transparent' }}></i>
          </div>
        </Dialog>
    </div>
  );
}

export default Home;