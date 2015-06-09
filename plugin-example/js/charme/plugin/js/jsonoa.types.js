/*
 * Copyright (c) 2014, CGI
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of
 *    conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list
 *    of conditions and the following disclaimer in the documentation and/or other materials
 *    provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors may be
 *    used to endorse or promote products derived from this software without specific prior
 *    written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 * THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

if (!jsonoa.types){
	jsonoa.types = {};
}
/**
 * JSON-LD node type definitions.
 * Type definitions consist of two parts, the declaration of any type specific constants,
 * and the definition of a template. The template is used for _creating_ new nodes of the specified type.
 * The TYPE is used for identifying nodes, and may be an array if the node is always specified with more than one type (eg. Text nodes)
 * Node definitions also define any constants used for accessing the values in them.
 */
jsonoa.types.Annotation=(function Annotation(){
	Annotation.TYPE='http://www.w3.org/ns/oa#Annotation';
	Annotation.MOTIVATED_BY='http://www.w3.org/ns/oa#motivatedBy';
	Annotation.ANNOTATED_BY='http://www.w3.org/ns/oa#annotatedBy';
	Annotation.BODY='http://www.w3.org/ns/oa#hasBody';
        Annotation.TARGET='http://www.w3.org/ns/oa#hasTarget';
	Annotation.DATE='http://www.w3.org/ns/oa#annotatedAt';
	Annotation.WAS_REVISION_OF='http://www.w3.org/ns/prov#wasRevisionOf';
        Annotation.WAS_INVALIDATED_BY='http://www.w3.org/ns/prov#wasInvalidatedBy';

	Annotation.TEMPLATE={
		"@id": "?",
		"@type": [Annotation.TYPE],
		"http://www.w3.org/ns/oa#motivatedBy": [],
		"http://www.w3.org/ns/oa#hasBody": [],
		"http://www.w3.org/ns/oa#hasTarget": {"@id":"?"}
	};
	return Annotation;
})();

jsonoa.types.Composite=(function Composite(){
    Composite.TYPE='http://www.w3.org/ns/oa#Composite';
    Composite.ITEM='http://www.w3.org/ns/oa#item';

    Composite.TEMPLATE=  {
        "@id": "?",
        "@type": [Composite.TYPE],
        "http://www.w3.org/ns/oa#item": []
    }
    return Composite;
})();

jsonoa.types.CitationAct=(function CitationAct(){
	CitationAct.TYPE='http://purl.org/spar/cito/CitationAct';
	CitationAct.CITING_ENTITY='http://purl.org/spar/cito/hasCitingEntity';
	CitationAct.CITED_ENTITY='http://purl.org/spar/cito/hasCitedEntity';

	CitationAct.TEMPLATE = {
		"@id":"?",
		"@type":[CitationAct.TYPE],
		"http://purl.org/spar/cito/hasCitationEvent": {"@id":"http://purl.org/spar/cito/citesAsDataSource"},
		"http://purl.org/spar/cito/hasCitedEntity":{"@id":"?"},
		"http://purl.org/spar/cito/hasCitingEntity":{"@id":"?"}
	};
	return CitationAct;
})();
jsonoa.types.Text=(function Text(){
	Text.CONTENT_AS_TEXT = 'http://www.w3.org/2011/content#ContentAsText';
	Text.TEXT = 'http://purl.org/dc/dcmitype/Text';
	Text.TYPE=[Text.TEXT, Text.CONTENT_AS_TEXT];
	Text.CONTENT_CHARS='http://www.w3.org/2011/content#chars';

	Text.TEMPLATE=
	{
		"@id": "?",
		"@type": [
			//Text bodies defined with two types for some reason
			Text.TYPE[0],
			Text.TYPE[1]
		],
		"http://purl.org/dc/elements/1.1/format": "text/plain",
		"http://www.w3.org/2011/content#chars": "?"
	};
	return Text;
})();
jsonoa.types.Person=(function Person(){
	Person.TYPE='http://xmlns.com/foaf/0.1/Person';
	Person.USER_NAME = 'http://xmlns.com/foaf/0.1/accountName';
	Person.FAMILY_NAME = 'http://xmlns.com/foaf/0.1/familyName';
	Person.GIVEN_NAME = 'http://xmlns.com/foaf/0.1/givenName';
        Person.EMAIL = 'http://xmlns.com/foaf/0.1/mbox';

	Person.TEMPLATE = {
		"@id":"?",
		"@type":[Person.CITATION_ACT],
		"http://purl.org/spar/cito/hasCitationEvent": {"@id":"http://purl.org/spar/cito/citesAsDataSource"},
		"http://purl.org/spar/cito/hasCitedEntity":{"@id":"?"},
		"http://purl.org/spar/cito/hasCitingEntity":{"@id":"?"}
	};
	return Person;
})();
jsonoa.types.SemanticTag=(function SemanticTag(){
	SemanticTag.TYPE='http://www.w3.org/ns/oa#SemanticTag';
	SemanticTag.PREF_LABEL='http://www.w3.org/2004/02/skos/core#prefLabel';

	SemanticTag.TEMPLATE = {
		"@id": "?",
		"@type": [SemanticTag.TYPE],
		"http://www.w3.org/2004/02/skos/core#prefLabel": "?"
	};
	return SemanticTag;
})();
jsonoa.types.Organization=(function Organization(){
	Organization.TYPE='http://xmlns.com/foaf/0.1/Organization';
	Organization.URI='@id';
	Organization.NAME='http://xmlns.com/foaf/0.1/name';

	Organization.TEMPLATE={
		"@id": "?",
		"@type": Organization.TYPE,
		"http://xmlns.com/foaf/0.1/name": "?"
	};
	return Organization;
})();
jsonoa.types.Dataset=(function Dataset(){
	Dataset.TYPE = 'http://purl.org/dc/dcmitype/Dataset';
        Dataset.TEMPLATE = {"@id": "?", "@type": [Dataset.TYPE]};
	return Dataset;
})();
jsonoa.types.Document=(function Document(){
	Document.TYPE='http://purl.org/voc/charme#DocType';
        Document.TEMPLATE = {"@id": "?", "@type": [Document.TYPE]};
	return Document;
})();
jsonoa.types.TechnicalReport=(function TechnicalReport(){
	TechnicalReport.TYPE='http://purl.org/spar/fabio/TechnicalReport';
        TechnicalReport.TEMPLATE = {"@id": "?", "@type": [TechnicalReport.TYPE]};
	return TechnicalReport;
})();
jsonoa.types.AlgorithmTheoreticalBasisDocument=(function AlgorithmTheoreticalBasisDocument(){
	AlgorithmTheoreticalBasisDocument.TYPE='http://purl.org/voc/charme#AlgorithmTheoreticalBasisDocument';
        AlgorithmTheoreticalBasisDocument.TEMPLATE = {"@id": "?", "@type": [AlgorithmTheoreticalBasisDocument.TYPE]};
	return AlgorithmTheoreticalBasisDocument;
})();
jsonoa.types.ProductUserManual=(function ProductUserManual(){
	ProductUserManual.TYPE='http://purl.org/voc/charme#ProductUserManual';
        ProductUserManual.TEMPLATE = {"@id": "?", "@type": [ProductUserManual.TYPE]};
	return ProductUserManual;
})();
jsonoa.types.ValidationReport=(function ValidationReport(){
	ValidationReport.TYPE='http://purl.org/voc/charme#ValidationReport';
        ValidationReport.TEMPLATE = {"@id": "?", "@type": [ValidationReport.TYPE]};
	return ValidationReport;
})();
jsonoa.types.OperationReport=(function OperationReport(){
	OperationReport.TYPE='http://purl.org/voc/charme#OperationReport';
        OperationReport.TEMPLATE = {"@id": "?", "@type": [OperationReport.TYPE]};
	return OperationReport;
})();
jsonoa.types.ServiceMessage=(function ServiceMessage(){
	ServiceMessage.TYPE='http://purl.org/voc/charme#ServiceMessage';
        ServiceMessage.TEMPLATE = {"@id": "?", "@type": [ServiceMessage.TYPE]};
	return ServiceMessage;
})();
jsonoa.types.ProductChangeLog=(function ProductChangeLog(){
	ProductChangeLog.TYPE='http://purl.org/voc/charme#ProductChangeLog';
        ProductChangeLog.TEMPLATE = {"@id": "?", "@type": [ProductChangeLog.TYPE]};
	return ProductChangeLog;
})();
jsonoa.types.KnownProductDisruption=(function KnownProductDisruption(){
	KnownProductDisruption.TYPE='http://purl.org/voc/charme#KnownProductDisruption';
        KnownProductDisruption.TEMPLATE = {"@id": "?", "@type": [KnownProductDisruption.TYPE]};
	return KnownProductDisruption;
})();
jsonoa.types.SignificantEvents=(function SignificantEvents(){
	SignificantEvents.TYPE='http://purl.org/voc/charme#SignificantEvents';
        SignificantEvents.TEMPLATE = {"@id": "?", "@type": [SignificantEvents.TYPE]};
	return SignificantEvents;
})();
jsonoa.types.SignificantEvent=(function SignificantEvent(){
	SignificantEvent.TYPE='http://purl.org/voc/charme#SignificantEvent';
        SignificantEvent.TEMPLATE = {"@id": "?", "@type": [SignificantEvent.TYPE]};
	return SignificantEvent;
})();
jsonoa.types.Location=(function Location(){
	Location.TYPE='http://purl.org/voc/charme#Location';
        Location.TEMPLATE = {"@id": "?", "@type": [Location.TYPE]};
	return Location;
})();
jsonoa.types.country=(function country(){
	country.TYPE='http://purl.org/voc/charme#country';
        country.TEMPLATE = {"@id": "?", "@type": [country.TYPE]};
	return country;
})();
jsonoa.types.namedRegion=(function namedRegion(){
	namedRegion.TYPE='http://purl.org/voc/charme#namedRegion';
        namedRegion.TEMPLATE = {"@id": "?", "@type": [namedRegion.TYPE]};
	return namedRegion;
})();
jsonoa.types.location=(function location(){
	location.TYPE='http://purl.org/voc/charme#location';
        location.TEMPLATE = {"@id": "?", "@type": [location.TYPE]};
	return location;
})();
jsonoa.types.eventName=(function eventName(){
	eventName.TYPE='http://purl.org/voc/charme#eventName';
        eventName.TEMPLATE = {"@id": "?", "@type": [eventName.TYPE]};
	return eventName;
})();
jsonoa.types.eventSummary=(function eventSummary(){
	eventSummary.TYPE='http://purl.org/voc/charme#eventSummary';
        eventSummary.TEMPLATE = {"@id": "?", "@type": [eventSummary.TYPE]};
	return eventSummary;
})();
jsonoa.types.ClimateEvent=(function ClimateEvent(){
	ClimateEvent.TYPE='http://purl.org/voc/charme#ClimateEvent';
        ClimateEvent.TEMPLATE = {"@id": "?", "@type": [ClimateEvent.TYPE]};
	return ClimateEvent;
})();
jsonoa.types.HurricaneEvent=(function HurricaneEvent(){
	HurricaneEvent.TYPE='http://purl.org/voc/charme#HurricaneEvent';
        HurricaneEvent.TEMPLATE = {"@id": "?", "@type": [HurricaneEvent.TYPE]};
	return HurricaneEvent;
})();
jsonoa.types.VolcanicEruptionEvent=(function VolcanicEruptionEvent(){
	VolcanicEruptionEvent.TYPE='http://purl.org/voc/charme#VolcanicEruptionEvent';
        VolcanicEruptionEvent.TEMPLATE = {"@id": "?", "@type": [VolcanicEruptionEvent.TYPE]};
	return VolcanicEruptionEvent;
})();
jsonoa.types.ElNinoEvent=(function ElNinoEvent(){
	ElNinoEvent.TYPE='http://purl.org/voc/charme#ElNinoEvent';
        ElNinoEvent.TEMPLATE = {"@id": "?", "@type": [ElNinoEvent.TYPE]};
	return ElNinoEvent;
})();
jsonoa.types.DroughtEvent=(function DroughtEvent(){
	DroughtEvent.TYPE='http://purl.org/voc/charme#DroughtEvent';
        DroughtEvent.TEMPLATE = {"@id": "?", "@type": [DroughtEvent.TYPE]};
	return DroughtEvent;
})();
jsonoa.types.StormEvent=(function StormEvent(){
	StormEvent.TYPE='http://purl.org/voc/charme#StormEvent';
        StormEvent.TEMPLATE = {"@id": "?", "@type": [StormEvent.TYPE]};
	return StormEvent;
})();
jsonoa.types.WildfiresEvent=(function WildfiresEvent(){
	WildfiresEvent.TYPE='http://purl.org/voc/charme#WildfiresEvent';
        WildfiresEvent.TEMPLATE = {"@id": "?", "@type": [WildfiresEvent.TYPE]};
	return WildfiresEvent;
})();
jsonoa.types.SoftwareAndSystemEvent=(function SoftwareAndSystemEvent(){
	SoftwareAndSystemEvent.TYPE='http://purl.org/voc/charme#SoftwareAndSystemEvent';
        SoftwareAndSystemEvent.TEMPLATE = {"@id": "?", "@type": [SoftwareAndSystemEvent.TYPE]};
	return SoftwareAndSystemEvent;
})();
jsonoa.types.IfsEvent=(function IfsEvent(){
	IfsEvent.TYPE='http://purl.org/voc/charme#IfsEvent';
        IfsEvent.TEMPLATE = {"@id": "?", "@type": [IfsEvent.TYPE]};
	return IfsEvent;
})();
jsonoa.types.SystemEvent=(function SystemEvent(){
	SystemEvent.TYPE='http://purl.org/voc/charme#SystemEvent';
        SystemEvent.TEMPLATE = {"@id": "?", "@type": [SystemEvent.TYPE]};
	return SystemEvent;
})();
jsonoa.types.DataAndObservingSystemEvents=(function DataAndObservingSystemEvents(){
	DataAndObservingSystemEvents.TYPE='http://purl.org/voc/charme#DataAndObservingSystemEvents';
        DataAndObservingSystemEvents.TEMPLATE = {"@id": "?", "@type": [DataAndObservingSystemEvents.TYPE]};
	return DataAndObservingSystemEvents;
})();
jsonoa.types.SatelliteEvent=(function SatelliteEvent(){
	SatelliteEvent.TYPE='http://purl.org/voc/charme#SatelliteEvent';
        SatelliteEvent.TEMPLATE = {"@id": "?", "@type": [SatelliteEvent.TYPE]};
	return SatelliteEvent;
})();
jsonoa.types.DropsondeEvent=(function DropsondeEvent(){
	DropsondeEvent.TYPE='http://purl.org/voc/charme#DropsondeEvent';
        DropsondeEvent.TEMPLATE = {"@id": "?", "@type": [DropsondeEvent.TYPE]};
	return DropsondeEvent;
})();
jsonoa.types.AircraftEvent=(function AircraftEvent(){
	AircraftEvent.TYPE='http://purl.org/voc/charme#AircraftEvent';
        AircraftEvent.TEMPLATE = {"@id": "?", "@type": [AircraftEvent.TYPE]};
	return AircraftEvent;
})();
jsonoa.types.BuoyEvent=(function BuoyEvent(){
	BuoyEvent.TYPE='http://purl.org/voc/charme#BuoyEvent';
        BuoyEvent.TEMPLATE = {"@id": "?", "@type": [BuoyEvent.TYPE]};
	return BuoyEvent;
})();
jsonoa.types.ShipEvent=(function ShipEvent(){
	ShipEvent.TYPE='http://purl.org/voc/charme#ShipEvent';
        ShipEvent.TEMPLATE = {"@id": "?", "@type": [ShipEvent.TYPE]};
	return ShipEvent;
})();
jsonoa.types.LandStationEvent=(function LandStationEvent(){
	LandStationEvent.TYPE='http://purl.org/voc/charme#LandStationEvent';
        LandStationEvent.TEMPLATE = {"@id": "?", "@type": [LandStationEvent.TYPE]};
	return LandStationEvent;
})();
jsonoa.types.MobileEvent=(function MobileEvent(){
	MobileEvent.TYPE='http://purl.org/voc/charme#MobileEvent';
        MobileEvent.TEMPLATE = {"@id": "?", "@type": [MobileEvent.TYPE]};
	return MobileEvent;
})();
jsonoa.types.AlarmEvent=(function AlarmEvent(){
	AlarmEvent.TYPE='http://purl.org/voc/charme#AlarmEvent';
        AlarmEvent.TEMPLATE = {"@id": "?", "@type": [AlarmEvent.TYPE]};
	return AlarmEvent;
})();
jsonoa.types.OperationalEvent=(function OperationalEvent(){
	OperationalEvent.TYPE='http://purl.org/voc/charme#OperationalEvent';
        OperationalEvent.TEMPLATE = {"@id": "?", "@type": [OperationalEvent.TYPE]};
	return OperationalEvent;
})();
jsonoa.types.DatasetSubset=(function DatasetSubset(){
	DatasetSubset.TYPE='http://purl.org/voc/charme#DatasetSubset';
        DatasetSubset.TEMPLATE = {"@id": "?", "@type": [DatasetSubset.TYPE]};
	return DatasetSubset;
})();
jsonoa.types.SubsetSelector=(function SubsetSelector(){
	SubsetSelector.TYPE='http://purl.org/voc/charme#SubsetSelector';
        SubsetSelector.TEMPLATE = {"@id": "?", "@type": [SubsetSelector.TYPE]};
	return SubsetSelector;
})();
jsonoa.types.hasVariable=(function hasVariable(){
	hasVariable.TYPE='http://purl.org/voc/charme#hasVariable';
        hasVariable.TEMPLATE = {"@id": "?", "@type": [hasVariable.TYPE]};
	return hasVariable;
})();
jsonoa.types.Variable=(function Variable(){
	Variable.TYPE='http://purl.org/voc/charme#Variable';
        Variable.TEMPLATE = {"@id": "?", "@type": [Variable.TYPE]};
	return Variable;
})();
jsonoa.types.hasSpatialExtent=(function hasSpatialExtent(){
	hasSpatialExtent.TYPE='http://purl.org/voc/charme#hasSpatialExtent';
        hasSpatialExtent.TEMPLATE = {"@id": "?", "@type": [hasSpatialExtent.TYPE]};
	return hasSpatialExtent;
})();
jsonoa.types.hasVerticalExtent=(function hasVerticalExtent(){
	hasVerticalExtent.TYPE='http://purl.org/voc/charme#hasVerticalExtent';
        hasVerticalExtent.TEMPLATE = {"@id": "?", "@type": [hasVerticalExtent.TYPE]};
	return hasVerticalExtent;
})();
jsonoa.types.hasTemporalExtent=(function hasTemporalExtent(){
	hasTemporalExtent.TYPE='http://purl.org/voc/charme#hasTemporalExtent';
        hasTemporalExtent.TEMPLATE = {"@id": "?", "@type": [hasTemporalExtent.TYPE]};
	return hasTemporalExtent;
})();
jsonoa.types.hasInternalName=(function hasInternalName(){
	hasInternalName.TYPE='http://purl.org/voc/charme#hasInternalName';
        hasInternalName.TEMPLATE = {"@id": "?", "@type": [hasInternalName.TYPE]};
	return hasInternalName;
})();
jsonoa.types.hasCfName=(function hasCfName(){
	hasCfName.TYPE='http://purl.org/voc/charme#hasCfName';
        hasCfName.TEMPLATE = {"@id": "?", "@type": [hasCfName.TYPE]};
	return hasCfName;
})();
jsonoa.types.hasNamedRegion=(function hasNamedRegion(){
	hasNamedRegion.TYPE='http://purl.org/voc/charme#hasNamedRegion';
        hasNamedRegion.TEMPLATE = {"@id": "?", "@type": [hasNamedRegion.TYPE]};
	return hasNamedRegion;
})();
jsonoa.types.hasCalendar=(function hasCalendar(){
	hasCalendar.TYPE='http://purl.org/voc/charme#hasCalendar';
        hasCalendar.TEMPLATE = {"@id": "?", "@type": [hasCalendar.TYPE]};
	return hasCalendar;
})();
jsonoa.types.hasTemporalStart=(function hasTemporalStart(){
	hasTemporalStart.TYPE='http://purl.org/voc/charme#hasTemporalStart';
        hasTemporalStart.TEMPLATE = {"@id": "?", "@type": [hasTemporalStart.TYPE]};
	return hasTemporalStart;
})();
jsonoa.types.hasTemporalEnd=(function hasTemporalEnd(){
	hasTemporalEnd.TYPE='http://purl.org/voc/charme#hasTemporalEnd';
        hasTemporalEnd.TEMPLATE = {"@id": "?", "@type": [hasTemporalEnd.TYPE]};
	return hasTemporalEnd;
})();
jsonoa.types.Calendars=(function Calendars(){
	Calendars.TYPE='http://purl.org/voc/charme#Calendars';
        Calendars.TEMPLATE = {"@id": "?", "@type": [Calendars.TYPE]};
	return Calendars;
})();
jsonoa.types.Calendar=(function Calendar(){
	Calendar.TYPE='http://purl.org/voc/charme#Calendar';
        Calendar.TEMPLATE = {"@id": "?", "@type": [Calendar.TYPE]};
	return Calendar;
})();
jsonoa.types.Gregorian=(function Gregorian(){
	Gregorian.TYPE='http://purl.org/voc/charme#Gregorian';
        Gregorian.TEMPLATE = {"@id": "?", "@type": [Gregorian.TYPE]};
	return Gregorian;
})();
jsonoa.types.ConferencePaper=(function ConferencePaper(){
	ConferencePaper.TYPE='http://purl.org/spar/fabio/ConferencePaper';
	ConferencePaper.TEMPLATE = {"@id": "?", "@type": [ConferencePaper.TYPE]};
	return ConferencePaper;
})();
jsonoa.types.JournalArticle=(function JournalArticle(){
	JournalArticle.TYPE='http://purl.org/spar/fabio/JournalArticle';
	JournalArticle.TEMPLATE={"@id": "?", "@type": [JournalArticle.TYPE]};
	return JournalArticle;
})();
jsonoa.types.Article=(function Article(){
	Article.TYPE='http://purl.org/spar/fabio/Article';
	Article.TEMPLATE={"@id": "?", "@type": [Article.TYPE]};
	return Article;
})();
jsonoa.types.MetadataDocument=(function MetadataDocument(){
	MetadataDocument.TYPE='http://purl.org/spar/fabio/MetadataDocument';
	MetadataDocument.TEMPLATE={"@id": "?", "@type": [MetadataDocument.TYPE]};
	return MetadataDocument;
})();
jsonoa.types.AcademicProceedings=(function AcademicProceedings(){
	AcademicProceedings.TYPE='http://purl.org/spar/fabio/AcademicProceedings';
	AcademicProceedings.TEMPLATE = {"@id": "?", "@type": [AcademicProceedings.TYPE]};
	return AcademicProceedings;
})();

// Not a target type, but included in the node response so included here to avoid 'unknown node type' error
jsonoa.types.ConceptScheme=(function ConceptScheme(){
	ConceptScheme.TYPE='http://www.w3.org/2004/02/skos/core#ConceptScheme';
        ConceptScheme.TEMPLATE = {"@id": "?", "@type": [ConceptScheme.TYPE]};
	return ConceptScheme;
})();
jsonoa.types.Concept=(function Concept(){
    Concept.TYPE='http://www.w3.org/2004/02/skos/core#Concept';
    Concept.TEMPLATE = {"@id": "?", "@type": [Concept.TYPE]};
    return Concept;
})();
jsonoa.types.Class=(function Class(){
    Class.TYPE='http://www.w3.org/2002/07/owl#Class';
    Class.TEMPLATE = {"@id": "?", "@type": [Class.TYPE]};
    return Class;
})();

// Old types no longer valid but kept here for now, as used by old annotations still in the node
jsonoa.types.Instrument=(function Instrument(){
	Instrument.TYPE='http://blah.org/blah/Instrument';
	Instrument.TEMPLATE = {"@id": "?", "@type": [Instrument.TYPE]};
	return Instrument;
})();
jsonoa.types.Platform=(function Platform(){
	Platform.TYPE='http://blah.org/blah/Platform';
	Platform.TEMPLATE = {"@id": "?", "@type": [Platform.TYPE]};
	return Platform;
})();

/**
 * The following types should NOT be created on the client, and as such have no template
 */
jsonoa.types.Activity=(function Activity(){
	Activity.TYPE='http://www.w3.org/ns/prov#Activity';
	Activity.GENERATED='http://www.w3.org/ns/prov#generated';
	Activity.INVALIDATED='http://www.w3.org/ns/prov#invalidated';
	Activity.ENDED_AT='http://www.w3.org/ns/prov#wasEndedAt';
	Activity.ENDED_BY='http://www.w3.org/ns/prov#wasEndedBy';
	Activity.STARTED_AT='http://www.w3.org/ns/prov#wasStartedAt';
	Activity.STARTED_BY='http://www.w3.org/ns/prov#wasStartedBy';
	return Activity;
})();
