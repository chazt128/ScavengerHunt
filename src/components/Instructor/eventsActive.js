import React, { Component } from 'react';
import { Spinner } from 'reactstrap' 
import { withFirebase } from '../Firebase';
import { Link, withRouter } from 'react-router-dom';

class ActiveEvents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      activeEvents: []
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    let user = this.props.user;
    // converting from millisec to sec to compare to endDate

    // console.log(today)

   this.unsubscribe = this.props.firebase
      .scavengerHunts().where("email", "==", user.email)
      .onSnapshot(snapshot => {
        let activeEvents = [];

        snapshot.forEach(doc => {
          let data = doc.data();
          const closed = data.closed;
          const endDate = data.dateEnd.seconds;
          // convert millisec to sec
          const today = (Date.now() / 1000).toFixed(0);

          if(today < endDate && !closed) {
            activeEvents.push(data);
          }
        });

        this.setState({
          activeEvents,
          loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { activeEvents, loading } = this.state;
    const URL = this.props.match.url;
    return (
      <div>
        <h4>On-Going Hunt Events</h4>
        {loading && <Spinner color="danger" />}
        {!loading && activeEvents.length===0 && <p>You have not created any scavenger hunt events yet.<br />Create an event and provide your participants with the access code!</p>}
        {activeEvents.map(scavengerHunt => (
            <div key={scavengerHunt.accessCode}>
              <Link to={`${URL}/${scavengerHunt.accessCode}`} className="text-danger">
                <h5 className="my-3">{scavengerHunt.name}</h5>
              </Link>
            </div>
        ))}
      </div>
    );
  }
}

export default withRouter(withFirebase(ActiveEvents));