import React, { useState, useEffect } from 'react';

interface TimeZone {
    id: string;
    name: string;
    region: string;
    offset: number;
}

interface TimeWorldResultProps {
    timeZones: TimeZone[];
}

const TimeWorldResult: React.FC<TimeWorldResultProps> = ({ timeZones }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const regions = new Map(Object.entries(timeZones.reduce((acc, zone) => {
        (acc[zone.region] = acc[zone.region] || []).push(zone);
        return acc;
    }, {} as Record<string, TimeZone[]>)));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date, offset: number) => {
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const tzDate = new Date(utc + offset * 3600 * 1000);
        return tzDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date, offset: number) => {
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const tzDate = new Date(utc + offset * 3600 * 1000);
        return tzDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const isWorkTime = (date: Date, offset: number) => {
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const tzDate = new Date(utc + offset * 3600 * 1000);
        const hour = tzDate.getHours();
        return hour >= 9 && hour <= 18;
    };

    return (
        <div className="spotlight-time-world">
            {Array.from(regions).map(([region, zones]) => (
                zones.length > 0 && (
                    <div key={region} className="time-region">
                        <h3 className="region-title">{region}</h3>
                        <div className="time-zone-list">
                            {zones.map((zone: TimeZone) => (
                                <div key={zone.id} className="time-zone-item">
                                    <div className="time-zone-name">{zone.name}</div>
                                    <div className="time-zone-date">{formatDate(currentTime, zone.offset)}</div>
                                    <div className={`time-zone-time ${isWorkTime(currentTime, zone.offset) ? 'work-time' : 'rest-time'}`}>
                                        {formatTime(currentTime, zone.offset)}
                                    </div>
                                    <div className="time-zone-date">{formatDate(currentTime, zone.offset)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}

            <div className="spotlight-footer">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        chrome.runtime.sendMessage({ action: "openOptionsPage", hash: 'time' });
                    }}
                >
                    The World Clock Settings
                </a>
            </div>
        </div>
    );
};

export default TimeWorldResult;
